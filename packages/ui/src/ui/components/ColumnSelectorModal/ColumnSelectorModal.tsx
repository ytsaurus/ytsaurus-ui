import React from 'react';
import hammer from '../../common/hammer';
import block from 'bem-cn-lite';

import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import Modal from '../Modal/Modal';
import ColumnSelector, {makeItemsCopy} from '../ColumnSelector/ColumnSelector';
import NoContentImage from '../../assets/img/svg/modal-no-content.svg';

import './ColumnSelectorModal.scss';

const b = block('column-selector-modal');

export type ColumnSelectorModalProps<DataT> = {
    items: Array<ColumnSelectorItem<DataT>>;
    srcItems: Array<ColumnSelectorItem<DataT>>;
    isVisible?: boolean;
    onChange: (items: Array<ColumnSelectorItem<DataT>>) => void;
    onConfirm: (items: Array<ColumnSelectorItem<DataT>>) => void;
    onCancel: () => void;

    itemRenderer: (item: ColumnSelectorItem<DataT>) => React.ReactNode;
    entity: string;
};

export type ColumnSelectorItem<DataT> = {
    name: string;
    checked: boolean;
    data: DataT;
    disabled?: boolean;
    keyColumn?: boolean;
};

type Props<T> = ColumnSelectorModalProps<T>;

type State<T> = Pick<Props<T>, 'items' | 'srcItems'> & {itemsOrder: Array<string>};

export default class ColumnSelectorModal<T = never> extends React.Component<Props<T>, State<T>> {
    static defaultProps: Partial<Props<unknown>> = {
        entity: 'columns',
    };

    state: State<T> = {
        srcItems: this.props.srcItems || this.props.items,
        items: makeItemsCopy(this.props.items),
        itemsOrder: this._getItemsOrder(this.props.items),
    };

    // in React 16.3 there is another way to do it: getDerivedStateFromProps;
    // revise this place once received data is managed by Redux
    componentDidUpdate(prevProps: Props<T>) {
        const {items, srcItems} = this.props;
        if (prevProps.items !== items || prevProps.srcItems !== srcItems) {
            // don't update itemsOrder
            this.setState({
                srcItems: srcItems || this.props.items,
                items: this._getOrderedItems(makeItemsCopy(items)),
            });
        }
    }

    _handleCONFIRMButtonClick = () => {
        const {items} = this.state;
        this.props.onConfirm(items);
    };

    _handleCANCELButtonClick = () => {
        const {items} = this.props;
        const order = this._getItemsOrder(items);
        // reset state to initial on cancel
        this.setState({
            items: this._getOrderedItems(makeItemsCopy(items)),
            itemsOrder: order,
        });
        this.props.onCancel();
    };

    _getItemsOrder(items: Props<T>['items']) {
        return map_(items, (item) => item.name);
    }

    _getOrderedItems(items: Props<T>['items'], order = this.state.itemsOrder) {
        return items.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    }

    _getSelectorProps<P>(props: P, items: Props<T>['items']) {
        return {
            ...props,
            items,
            showDisabledItems: true,
            isHeadless: false,
            isFilterable: true,
            onChange: this.onSourceChange,
        };
    }

    _getSortableSelectorProps<P>(props: P, items: Props<T>['items']) {
        return {
            ...props,
            items,
            isSelectable: false,
            isSortable: true,
            showSelectedOnly: true,
            onChange: this.onDestinationChange,
        };
    }

    calculateSrcItems(newItemsMap: Record<string, ColumnSelectorItem<T>>) {
        return map_(this.state.srcItems, (item) => {
            const newItem = newItemsMap[item.name];

            if (newItem && newItem.checked !== item.checked) {
                return newItem;
            }

            return item;
        });
    }

    onSourceChange = ({items: newItems}: Pick<Props<T>, 'items'>) => {
        const {items} = this.state;
        const newItemsMap = reduce_(
            newItems,
            (acc, data) => {
                acc[data.name] = data;
                return acc;
            },
            {} as Record<string, ColumnSelectorItem<T>>,
        );

        const unchanged: Props<T>['items'] = [];
        const changed: Props<T>['items'] = [];
        forEach_(items, (item) => {
            const newItem = newItemsMap[item.name];
            if (newItem && newItem.checked !== item.checked) {
                const dst = newItem.keyColumn ? unchanged : changed;
                dst.push(newItem);
            } else {
                unchanged.push(item);
            }
        });

        const preparedItems = unchanged.concat(changed);
        // don't update itemsOrder
        this.setState({
            items: this._getOrderedItems(preparedItems),
            srcItems: this.calculateSrcItems(newItemsMap),
        });
    };

    onDestinationChange = ({items: newItems}: Pick<Props<T>, 'items'>) => {
        const newItemsMap = reduce_(
            newItems,
            (acc, data) => {
                acc[data.name] = data;
                return acc;
            },
            {} as Record<string, ColumnSelectorItem<T>>,
        );

        const order = this._getItemsOrder(newItems);

        this.setState({
            items: this._getOrderedItems(newItems, order),
            itemsOrder: order,
            srcItems: this.calculateSrcItems(newItemsMap),
        });
    };

    renderColumnSelector({
        props,
        title,
        description,
        className,
    }: {
        props: object;
        title: string;
        description: string;
        className?: string;
    }) {
        return (
            <ColumnSelector {...props} className={className}>
                <div className={b('no-content')}>
                    <p>
                        <strong>{title}</strong>
                    </p>
                    <p>{description}</p>
                    <NoContentImage />
                </div>
            </ColumnSelector>
        );
    }

    renderContent() {
        const {isVisible, entity, ...rest} = this.props; // eslint-disable-line
        const {items, srcItems} = this.state;

        const headingCN = block('elements-heading')({size: 's'}, b('header'));

        const selectorProps = this._getSelectorProps(rest, srcItems);
        const sortableSelectorProps = this._getSortableSelectorProps(selectorProps, items);
        const selectedItemsCount = reduce_(
            sortableSelectorProps.items,
            (acc, item) => (item.disabled || !item.checked ? acc : ++acc),
            0,
        );

        return (
            isVisible && (
                <div className={b()}>
                    <div className={b('panel', {left: 'yes'})}>
                        <div className={headingCN}>
                            All &nbsp;
                            <span className="elements-secondary-text">{srcItems.length}</span>
                        </div>

                        {this.renderColumnSelector({
                            props: selectorProps,
                            title: `No available ${entity}`,
                            description: `No ${entity} matching your filtering criteria`,
                        })}
                    </div>

                    <div className={b('panel')}>
                        <div className={headingCN}>
                            Selected &nbsp;
                            <span className="elements-secondary-text">{selectedItemsCount}</span>
                        </div>

                        {this.renderColumnSelector({
                            props: sortableSelectorProps,
                            title: `No selected ${entity}`,
                            description: `Add ${entity} you need from the All section.`,
                        })}
                    </div>
                </div>
            )
        );
    }

    render() {
        const {isVisible, entity} = this.props;
        const title = `${hammer.format['FirstUppercase'](entity)} setup`;

        return (
            <Modal
                size="l"
                title={title}
                borderless={true}
                visible={isVisible}
                confirmText="Apply"
                onConfirm={this._handleCONFIRMButtonClick}
                onCancel={this._handleCANCELButtonClick}
                content={this.renderContent()}
                contentClassName="column-selector-modal-content"
            />
        );
    }
}
