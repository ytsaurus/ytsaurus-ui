import React, {Component} from 'react';
import cn from 'bem-cn-lite';
import {
    type SortEnd,
    SortableContainer as sortableContainer,
    SortableElement as sortableElement,
    SortableHandle as sortableHandle,
} from 'react-sortable-hoc';

import each_ from 'lodash/each';
import escapeRegExp_ from 'lodash/escapeRegExp';
import filter_ from 'lodash/filter';
import map_ from 'lodash/map';
import partition_ from 'lodash/partition';
import reduce_ from 'lodash/reduce';

import {List, TextInput} from '@gravity-ui/uikit';
import Icon from '../../components/Icon/Icon';

import {renderText} from '../../components/templates/utils';
import Button, {type ButtonProps} from '../Button/Button';

import i18n from './i18n';

import './ColumnSelector.scss';

const block = cn('column-selector');

export type ColumnSelectorItem = {
    name: string;
    checked: boolean;
    keyColumn?: boolean;
    caption?: string;
    disabled?: boolean;
    isDeletable?: boolean;
};

export type ColumnSelectorProps<T extends ColumnSelectorItem = ColumnSelectorItem> = {
    className?: string;
    srcItems?: T[];
    showDisabledItems?: boolean;
    isSortable?: boolean;
    isSelectable?: boolean;
    isFilterable?: boolean;
    showSelectedOnly?: boolean;
    onChange: (data: {items: T[]}) => void;
    children?: React.ReactNode;
    itemRenderer?: {render(item: T): React.ReactNode}['render'];
} & ({isHeadless: true; items: T[] | undefined} | {isHeadless?: false; items: T[]});

type ColumnSelectorState<T extends ColumnSelectorItem = ColumnSelectorItem> = {
    showSelectedOnly?: boolean;
    filter: string;
    items?: T[];
};
type SortableListProps = Pick<
    ColumnSelectorProps,
    'isSortable' | 'isSelectable' | 'itemRenderer'
> & {
    items: ColumnSelectorItem[];
    isDisabled?: boolean;
    onCheckBoxChange: React.MouseEventHandler<HTMLSpanElement>;
    useStaticSize?: boolean;
};
type SortableItemProps = Omit<SortableListProps, 'items' | 'useStaticSize'> & {
    item: ColumnSelectorItem;
};

export function makeItemsCopy<T extends ColumnSelectorItem>(items?: T[]): T[] {
    return map_(items, (item) => {
        return {...item};
    });
}

const DragHandle = sortableHandle(() => (
    <div className={block('drag-handle')}>
        <Icon face="solid" awesome="list" />
    </div>
));

const SortableItem = sortableElement<SortableItemProps>(
    ({
        item,
        isSortable,
        isSelectable,
        isDisabled,
        itemRenderer,
        onCheckBoxChange,
    }: SortableItemProps) => {
        const active = !isDisabled && !item.disabled;
        const className = block('list-item', {
            selected: item.checked && active && 'yes',
            selectable: isSelectable && active && 'yes',
            disabled: !active && 'yes',
        });

        let showAction: boolean | undefined = true;
        if (item.checked) {
            showAction = 'isDeletable' in item ? item.isDeletable : true;
        }

        return (
            <div className={className}>
                {isSortable && item.checked && <DragHandle />}
                <div className={block('list-item-name')}>
                    {item.keyColumn && <Icon awesome="key" />}
                    {itemRenderer!(item)}
                </div>
                {active && showAction && (
                    <span
                        className={block('list-item-check')}
                        onClick={onCheckBoxChange}
                        data-item={item.name}
                    >
                        <Icon awesome="check" />
                    </span>
                )}
                {!active && <Icon className={block('list-item-lock')} awesome="lock" />}
            </div>
        );
    },
);

const LIST_ITEM_HEIGHT = 40;

const SortableList = sortableContainer<SortableListProps>(
    ({
        items,
        isSortable,
        isDisabled,
        itemRenderer,
        onCheckBoxChange,
        isSelectable,
        useStaticSize,
    }: SortableListProps) => {
        const renderItem = (
            item: ColumnSelectorItem,
            _isItemActive: boolean,
            itemIndex: number,
        ) => (
            <SortableItem
                key={item.name}
                index={itemIndex}
                item={item}
                disabled={!isSortable}
                isSortable={isSortable}
                isDisabled={isDisabled}
                isSelectable={isSelectable}
                itemRenderer={itemRenderer}
                onCheckBoxChange={onCheckBoxChange}
            />
        );
        const mods = {'static-size': useStaticSize};

        return (
            <div className={block('list', mods)}>
                <List
                    items={items}
                    renderItem={renderItem}
                    itemHeight={LIST_ITEM_HEIGHT}
                    itemsHeight={items.length * LIST_ITEM_HEIGHT}
                    filterable={false}
                    virtualized
                />
            </div>
        );
    },
);

export default class ColumnSelector<
    T extends ColumnSelectorItem = ColumnSelectorItem,
> extends Component<ColumnSelectorProps<T>, ColumnSelectorState<T>> {
    static defaultProps = {
        itemRenderer: ({name, caption = name}: ColumnSelectorItem) =>
            renderText(caption, {asHTML: false}),
        isSortable: false,
        isHeadless: false,
        isSelectable: true,
        isFilterable: true,
        showSelectedOnly: false,
    };

    constructor(props: ColumnSelectorProps<T>) {
        const {items, isHeadless, showSelectedOnly} = props;
        super(props);

        const state: ColumnSelectorState<T> = {
            showSelectedOnly,
            filter: '',
        };
        if (isHeadless) {
            Object.assign(state, {items: makeItemsCopy(items)});
        }
        this.state = state;
    }

    get items() {
        return this.props.isHeadless ? this.state.items! : this.props.items;
    }

    get buttonALLisDisabled() {
        return this.items.every((item) => item.checked);
    }

    get buttonNONEisDisabled() {
        return !this.items.some((item) => item.checked);
    }

    /*
      Takes items from the proper place (props or state), modifies them and writes them back at the same place.
     */
    withActualItems(func: (data: {items: T[]}) => {items: T[]}) {
        const {onChange} = this.props;
        // headless widget keeps its state to itself, but calls onChange as a way of notifying caller about changes
        if (this.props.isHeadless) {
            const {items} = func({items: this.state.items || []});
            this.setState({items}, () => {
                onChange({items: [...this.state.items!]});
            });
        } else {
            // widget inside modal passes all changes to the modal component where they are put into state
            const {items} = func({items: this.props.items || []});
            onChange({items: [...items]});
        }
    }

    toggleItem = (name: string | null) => {
        this.withActualItems(({items}) => {
            const result = [...items];
            const index = result.findIndex((item) => item.name === name);
            const changedItem = result[index];
            result[index] = {...changedItem, checked: !changedItem.checked};

            return {items: result};
        });
    };

    selectAllItems = () => {
        this.withActualItems(({items}) => {
            const visibleMap = this.getVisibleItemsMap();
            const result = [...items];
            each_(result, (item, index) => {
                if (!visibleMap[item.name]) {
                    return;
                }
                if (!item.checked && !item.disabled) {
                    result[index] = {...item, checked: true};
                }
            });

            return {items: result};
        });
    };

    deselectAllItems = () => {
        this.withActualItems(({items}) => {
            const visibleMap = this.getVisibleItemsMap();
            const result = [...items];
            each_(result, (item, index) => {
                if (!visibleMap[item.name]) {
                    return;
                }
                if (item.checked && !item.disabled && (item.isDeletable ?? true)) {
                    result[index] = {...item, checked: false};
                }
            });

            return {items: result};
        });
    };

    invertItems = () => {
        this.withActualItems(({items}) => {
            const visibleItems = this.getVisibleItemsMap();
            const result = [...items];
            each_(result, (item, index) => {
                if (!visibleItems[item.name]) {
                    return;
                }
                if (!item.disabled) {
                    result[index] = {...item, checked: !item.checked};
                }
            });

            return {items: result};
        });
    };

    _handleCheckBoxChange = (event: React.MouseEvent<HTMLSpanElement>) => {
        this.toggleItem(event.currentTarget.getAttribute('data-item'));
    };

    _handleSortEnd = ({oldIndex, newIndex}: SortEnd) => {
        if (oldIndex === newIndex) {
            return;
        }

        this.withActualItems(({items}) => {
            const result = [...items];

            const {items: visibleItems} = this.getVisibleItems();
            const fromIndex = result.findIndex((item) => item.name === visibleItems[oldIndex].name);
            const toIndex = result.findIndex((item) => item.name === visibleItems[newIndex].name);

            const [removed] = result.splice(fromIndex, 1);
            result.splice(toIndex, 0, removed);

            return {items: result};
        });
    };

    _handleDefaultSort = () => {
        this.withActualItems(({items}) => {
            return {
                items: items.sort((a, b) => {
                    const aCaption = a.caption || a.name;
                    const bCaption = b.caption || b.name;

                    return aCaption.localeCompare(bCaption);
                }),
            };
        });
    };

    _toggleShownItems = () => {
        this.setState((prevState) => ({
            showSelectedOnly: !prevState.showSelectedOnly,
        }));
    };

    _changeFilter = (filter: string) => {
        this.setState({filter});
    };

    renderSearchBox() {
        return (
            <TextInput
                placeholder={i18n('search')}
                onUpdate={this._changeFilter}
                value={this.state.filter}
                hasClear={true}
            />
        );
    }

    renderControls() {
        const {isFilterable, isSelectable, isSortable, isHeadless} = this.props;
        const btnProps: ButtonProps = {
            size: 'm',
            className: block('controls-item'),
        };

        return (
            <div className={block('controls')}>
                {isFilterable && this.renderSearchBox()}
                {isHeadless && (
                    <Button {...btnProps} onClick={this._toggleShownItems}>
                        {i18n('action_selected')} &nbsp;
                        <span className="elements-secondary-text">
                            {filter_(this.items, (item) => item.checked).length}
                        </span>
                    </Button>
                )}
                {isSelectable && (
                    <Button
                        {...btnProps}
                        disabled={this.buttonALLisDisabled}
                        onClick={this.selectAllItems}
                    >
                        {i18n('action_add-all')}
                    </Button>
                )}
                {isSelectable && (
                    <Button {...btnProps} onClick={this.invertItems}>
                        {i18n('action_invert')}
                    </Button>
                )}
                {!isSelectable && (
                    <Button
                        {...btnProps}
                        disabled={this.buttonNONEisDisabled}
                        onClick={this.deselectAllItems}
                    >
                        {i18n('action_remove-all')}
                    </Button>
                )}
                {isSortable && (
                    <Button {...btnProps} onClick={this._handleDefaultSort}>
                        {i18n('action_default-sort')}
                    </Button>
                )}
            </div>
        );
    }

    filterItemsByName(items: T[]) {
        const re = new RegExp(escapeRegExp_(this.state.filter), 'i');
        return filter_(items, (item) => re.test(item.name));
    }

    filterItems(items: T[]) {
        const {showDisabledItems} = this.props;
        const result = showDisabledItems ? items : filter_(items, (item) => !item.disabled);

        const visibleItems = this.filterItemsByName(result);
        return this.state.showSelectedOnly
            ? filter_(visibleItems, (item) => item.checked)
            : visibleItems;
    }

    getVisibleItems() {
        const toSplit = this.filterItems(this.items);
        const [keyItems, items] = partition_(toSplit, (item) => item.keyColumn);
        return {items, keyItems};
    }

    getVisibleItemsMap() {
        return reduce_(
            this.filterItems(this.items),
            (acc: Record<string, T>, item) => {
                acc[item.name] = item;
                return acc;
            },
            {},
        );
    }

    renderList() {
        const {isSortable, isSelectable, itemRenderer, children, isHeadless} = this.props;

        const {items, keyItems} = this.getVisibleItems();

        const className = block(
            'content',
            {
                headless: isHeadless ? undefined : 'no',
                empty: items.length ? undefined : 'yes',
            },
            'pretty-scroll',
        );

        return (
            <div className={className}>
                {keyItems.length > 0 && (
                    <React.Fragment>
                        <SortableList
                            lockAxis="y"
                            isDisabled={false}
                            isSortable={false}
                            isSelectable={isSelectable}
                            items={keyItems}
                            itemRenderer={itemRenderer}
                            helperClass={block('list-item', {helper: 'yes'})}
                            onCheckBoxChange={this._handleCheckBoxChange}
                        />
                        {items.length > 0 && <div className={block('separator')} />}
                    </React.Fragment>
                )}
                {items.length > 0 && (
                    <SortableList
                        items={items}
                        isSelectable={isSelectable}
                        isSortable={isSortable}
                        itemRenderer={itemRenderer}
                        lockAxis="y"
                        helperClass={block('list-item', {helper: 'yes'})}
                        onSortEnd={this._handleSortEnd}
                        onCheckBoxChange={this._handleCheckBoxChange}
                        useDragHandle
                    />
                )}
                {!keyItems.length && !items.length && children}
            </div>
        );
    }

    override render() {
        const {isHeadless, isSortable, className} = this.props;
        const classNames = block(
            {
                headless: isHeadless ? 'yes' : undefined,
                sortable: isSortable ? undefined : 'no',
            },
            className,
        );
        return (
            <div className={classNames}>
                {this.renderControls()}
                {this.renderList()}
            </div>
        );
    }
}
