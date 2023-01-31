import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import {sortableContainer, sortableElement, sortableHandle} from 'react-sortable-hoc';
import ReactList from 'react-list';
import _ from 'lodash';
import {TextInput} from '@gravity-ui/uikit';
import Icon from '../../components/Icon/Icon';

import {renderText} from '../../components/templates/utils';

import './ColumnSelector.scss';
import Button from '../Button/Button';

const b = cn('column-selector');

export function makeItemsCopy(items) {
    return _.map(items, (item) => {
        return {...item};
    });
}

const DragHandle = sortableHandle(() => (
    <div className={b('drag-handle')}>
        <Icon face="solid" awesome="list" />
    </div>
));

const SortableItem = sortableElement(
    ({
        item,
        isSortable,
        isSelectable,
        isDisabled,
        itemRenderer,
        onCheckBoxChange,
        withClickableHandler,
    }) => {
        const active = !isDisabled && !item.disabled;
        const className = b('list-item', {
            selected: item.checked && active && 'yes',
            selectable: isSelectable && active && 'yes',
            disabled: !active && 'yes',
        });

        return (
            <div className={className}>
                {isSortable && item.checked && <DragHandle />}
                <div className={b('list-item-name')}>
                    {item.keyColumn && <Icon awesome="key" />}
                    {itemRenderer(item)}
                </div>
                {active && withClickableHandler && (
                    <span
                        className={b('list-item-check')}
                        onClick={onCheckBoxChange}
                        data-item={item.name}
                    >
                        <Icon awesome="check" />
                    </span>
                )}
                {!active && <Icon className={b('list-item-lock')} awesome="lock" />}
            </div>
        );
    },
);

const SortableList = sortableContainer(
    ({
        items,
        isSortable,
        isDisabled,
        itemRenderer,
        onCheckBoxChange,
        isSelectable,
        useStaticSize,
        withClickableHandler = true,
    }) => {
        const renderer = (index, key) => {
            const item = items[index];
            return (
                <SortableItem
                    key={key}
                    index={index}
                    item={item}
                    disabled={!isSortable}
                    isSortable={isSortable}
                    isDisabled={isDisabled}
                    isSelectable={isSelectable}
                    itemRenderer={itemRenderer}
                    onCheckBoxChange={onCheckBoxChange}
                    withClickableHandler={withClickableHandler}
                />
            );
        };
        // Use 'simple' placement for draggable items because 'uniform' produces bugs when items are dragged outside the viewport
        const type = isSortable ? 'simple' : 'uniform';
        const mods = {'static-size': useStaticSize};

        return (
            <div className={b('list', mods)}>
                <ReactList itemRenderer={renderer} length={items.length} type={type} />
            </div>
        );
    },
);

export default class ColumnSelector extends Component {
    static itemsProps = PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            checked: PropTypes.bool.isRequired,
            keyColumn: PropTypes.bool,
            caption: PropTypes.string,
            disabled: PropTypes.bool,
        }),
    );

    static propTypes = {
        className: PropTypes.string,
        items: ColumnSelector.itemsProps.isRequired,
        showDisabledItems: PropTypes.bool,
        isSortable: PropTypes.bool,
        isSelectable: PropTypes.bool,
        isFilterable: PropTypes.bool,
        showSelectedOnly: PropTypes.bool,
        isHeadless: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        children: PropTypes.node,
        itemRenderer: PropTypes.func,
    };

    static defaultProps = {
        itemRenderer: ({name, caption = name}) => renderText(caption, {asHTML: false}),
        isSortable: false,
        isHeadless: false,
        isSelectable: true,
        isFilterable: true,
        showSelectedOnly: false,
    };

    constructor(props) {
        const {items, isHeadless, showSelectedOnly} = props;
        super(props);

        const state = {
            showSelectedOnly,
            filter: '',
        };
        if (isHeadless) {
            Object.assign(state, {items: makeItemsCopy(items)});
        }
        this.state = state;
    }

    get items() {
        return this.props.isHeadless ? this.state.items : this.props.items;
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
    withActualItems(func) {
        const {onChange} = this.props;
        // headless widget keeps its state to itself, but calls onChange as a way of notifying caller about changes
        if (this.props.isHeadless) {
            const {items} = func({items: this.state.items || []});
            this.setState({items}, () => {
                onChange({items: [...this.state.items]});
            });
        } else {
            // widget inside modal passes all changes to the modal component where they are put into state
            const {items} = func({items: this.props.items || []});
            onChange({items: [...items]});
        }
    }

    toggleItem = (name) => {
        this.withActualItems(({items}) => {
            items = [...items];
            const index = items.findIndex((item) => item.name === name);
            const changedItem = items[index];
            items[index] = {...changedItem, checked: !changedItem.checked};

            return {items};
        });
    };

    selectAllItems = () => {
        this.withActualItems(({items}) => {
            const visibleMap = this.getVisibleItemsMap();
            items = [...items];
            _.each(items, (item, index) => {
                if (!visibleMap[item.name]) {
                    return;
                }
                if (!item.checked && !item.disabled) {
                    items[index] = {...item, checked: true};
                }
            });

            return {items};
        });
    };

    deselectAllItems = () => {
        this.withActualItems(({items}) => {
            const visibleMap = this.getVisibleItemsMap();
            items = [...items];
            _.each(items, (item, index) => {
                if (!visibleMap[item.name]) {
                    return;
                }
                if (item.checked && !item.disabled) {
                    items[index] = {...item, checked: false};
                }
            });

            return {items};
        });
    };

    invertItems = () => {
        this.withActualItems(({items}) => {
            const visibleItems = this.getVisibleItemsMap();
            items = [...items];
            _.each(items, (item, index) => {
                if (!visibleItems[item.name]) {
                    return;
                }
                if (!item.disabled) {
                    items[index] = {...item, checked: !item.checked};
                }
            });

            return {items};
        });
    };

    _handleCheckBoxChange = (event) => {
        this.toggleItem(event.currentTarget.getAttribute('data-item'));
    };

    _handleSortEnd = ({oldIndex, newIndex}) => {
        if (oldIndex === newIndex) {
            return;
        }

        this.withActualItems(({items}) => {
            items = [...items];

            const {items: visibleItems} = this.getVisibleItems();
            const fromIndex = items.findIndex((item) => item.name === visibleItems[oldIndex].name);
            const toIndex = items.findIndex((item) => item.name === visibleItems[newIndex].name);

            const [removed] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, removed);

            return {items};
        });
    };

    _toggleShownItems = () => {
        this.setState((prevState) => ({
            showSelectedOnly: !prevState.showSelectedOnly,
        }));
    };

    _changeFilter = (filter) => {
        this.setState({filter});
    };

    renderSearchBox() {
        return (
            <TextInput
                placeholder="Search..."
                onUpdate={this._changeFilter}
                value={this.state.filter}
                hasClear={true}
            />
        );
    }

    renderControls() {
        const {isFilterable, isSelectable, isHeadless} = this.props;
        const btnProps = {
            size: 'm',
            className: b('controls-item'),
        };

        return (
            <div className={b('controls')}>
                {isFilterable && this.renderSearchBox()}
                {isHeadless && (
                    <Button {...btnProps} onClick={this._toggleShownItems}>
                        Selected &nbsp;
                        <span className="elements-secondary-text">
                            {_.filter(this.items, (item) => item.checked).length}
                        </span>
                    </Button>
                )}
                {isSelectable && (
                    <Button
                        {...btnProps}
                        disabled={this.buttonALLisDisabled}
                        onClick={this.selectAllItems}
                    >
                        Add all
                    </Button>
                )}
                {isSelectable && (
                    <Button {...btnProps} onClick={this.invertItems}>
                        Invert list
                    </Button>
                )}
                {!isSelectable && (
                    <Button
                        {...btnProps}
                        disabled={this.buttonNONEisDisabled}
                        onClick={this.deselectAllItems}
                    >
                        Remove all
                    </Button>
                )}
            </div>
        );
    }

    filterItemsByName(items) {
        const re = new RegExp(_.escapeRegExp(this.state.filter), 'i');
        return _.filter(items, (item) => re.test(item.name));
    }

    filterItems(items) {
        const {showDisabledItems} = this.props;
        items = showDisabledItems ? items : _.filter(items, (item) => !item.disabled);

        const visibleItems = this.filterItemsByName(items);
        return this.state.showSelectedOnly
            ? _.filter(visibleItems, (item) => item.checked)
            : visibleItems;
    }

    getVisibleItems() {
        const toSplit = this.filterItems(this.items);
        const [keyItems, items] = _.partition(toSplit, (item) => item.keyColumn);
        return {items, keyItems};
    }

    getVisibleItemsMap() {
        return _.reduce(
            this.filterItems(this.items),
            (acc, item) => {
                acc[item.name] = item;
                return acc;
            },
            {},
        );
    }

    renderList() {
        const {isSortable, isSelectable, itemRenderer, children, isHeadless} = this.props;

        const {items, keyItems} = this.getVisibleItems();

        const className = b(
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
                            helperClass={b('list-item', {helper: 'yes'})}
                            onCheckBoxChange={this._handleCheckBoxChange}
                        />
                        {items.length > 0 && <div className={b('separator')} />}
                    </React.Fragment>
                )}
                {items.length > 0 && (
                    <SortableList
                        items={items}
                        isSelectable={isSelectable}
                        isSortable={isSortable}
                        itemRenderer={itemRenderer}
                        lockAxis="y"
                        helperClass={b('list-item', {helper: 'yes'})}
                        onSortEnd={this._handleSortEnd}
                        onCheckBoxChange={this._handleCheckBoxChange}
                        useDragHandle
                    />
                )}
                {!keyItems.length && !items.length && children}
            </div>
        );
    }

    render() {
        const {isHeadless, isSortable, className} = this.props;
        const classNames = b(
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
