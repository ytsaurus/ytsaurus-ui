import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {TabFieldVertical} from '@gravity-ui/dialog-fields';
import {connect} from 'react-redux';

import Button from '../../../../../components/Button/Button';
import Icon, {IconName} from '../../../../../components/Icon/Icon';

import {
    setCreateTableColumnsOrder,
    setCreateTableKeyColumns,
} from '../../../../../store/actions/navigation/modals/create-table';
import {ArrayElement} from '../../../../../types';
import {DropdownMenu} from '@gravity-ui/uikit';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';

import './CreateTableTabField.scss';

const block = cn('create-table-tab-field');

export const ASCENDING = 1;
export const DESCENDING = -1;

interface CWProps {
    onAddColumn: (active: boolean, opts: {duplicate: boolean}) => void;
    setKeyColumns: (v: CWState['keyColumns']) => void;
    setColumnsOrder: (v: CWState['orderedTabItems']) => void;
}

interface CWState {
    tabItems: Props['tabItems'];
    orderedTabItems: Array<TabItem>;
    keyColumns: Record<string, typeof ASCENDING | typeof DESCENDING>;
}

type TabItem = ArrayElement<Props['tabItems']>;

class ColumnsWrapper extends React.Component<Props & CWProps, CWState> {
    static getDerivedStateFromProps(props: Props, prevState: CWState) {
        const {tabItems} = props;
        const {tabItems: prevTabItems, orderedTabItems: prevOrderedTabItems} = prevState;

        const res: Partial<CWState> = {};

        if (tabItems !== prevTabItems) {
            const tabItemsMap: Record<string, TabItem> = {};
            _.forEach(tabItems, (item) => {
                tabItemsMap[item.id] = item;
            });

            const itemsToAdd = _.differenceBy(tabItems, prevTabItems, ({id}) => id);
            const idsToRemove = new Set<string>(
                _.differenceBy(prevTabItems, tabItems, ({id}) => id).map((item) => item.id),
            );

            const filtered = _.filter(prevOrderedTabItems, ({id}) => !idsToRemove.has(id));
            const orderedTabItems = _.map(filtered, ({id}) => ({
                ...tabItemsMap[id],
            }));

            res.tabItems = tabItems;
            res.orderedTabItems = orderedTabItems.concat(itemsToAdd);
        }

        return _.isEmpty(res) ? null : res;
    }

    state: CWState = {
        tabItems: [],
        orderedTabItems: [],
        keyColumns: {},
    };

    setKeyColumns(keyColumns: CWState['keyColumns']) {
        this.setState({keyColumns});
        this.props.setKeyColumns(keyColumns);
    }

    setOrderedTabItems(orderedTabItems: CWState['orderedTabItems']) {
        this.setState({orderedTabItems});
        this.props.setColumnsOrder(orderedTabItems);
    }

    onOrderChanged = (order: CWState['orderedTabItems'], newIndex: number, oldIndex: number) => {
        if (newIndex === oldIndex) {
            return;
        }

        let {keyColumns} = this.state;
        const moved = order[newIndex];

        if (newIndex < oldIndex) {
            const next = order[newIndex + 1];
            if (!keyColumns[moved.id] && keyColumns[next.id]) {
                keyColumns = {...keyColumns};
                keyColumns[moved.id] = 1;
                this.setKeyColumns(keyColumns);
            }
        } else {
            const prev = order[newIndex - 1];
            if (keyColumns[moved.id] && !keyColumns[prev.id]) {
                keyColumns = {...keyColumns};
                delete keyColumns[moved.id];
                this.setKeyColumns(keyColumns);
            }
        }
        this.setOrderedTabItems(order);
    };

    toggleKeyColumn = (item: TabItem, value?: CWState['keyColumns']['']) => {
        const keyColumns = {...this.state.keyColumns};
        if (!value) {
            delete keyColumns[item.id];
        } else {
            keyColumns[item.id] = value;
        }

        const orderedTabItems = _.sortBy(this.state.orderedTabItems, ({id}) => !keyColumns[id]);
        this.setKeyColumns(keyColumns);
        this.setOrderedTabItems(orderedTabItems);
    };

    onCloneColumn = () => {
        // The timeout is required to select the tab by click
        setTimeout(() => {
            const {onAddColumn} = this.props;
            onAddColumn(false, {duplicate: true});
        }, 1);
    };

    renderKeyIcon = (node: React.ReactNode, item: TabItem) => {
        const {keyColumns} = this.state;
        const current = keyColumns[item.id];

        const {icon, title} = (
            !current
                ? {icon: 'sort-alt', title: 'Unordered'}
                : current === DESCENDING
                  ? {icon: 'sort-amount-up', title: 'Descending'}
                  : {icon: 'sort-amount-down-alt', title: 'Ascending'}
        ) as {icon: IconName; title: string};

        return (
            <React.Fragment>
                {node}
                <Tooltip content={'Clone'}>
                    <Button view={'flat'} onClick={this.onCloneColumn}>
                        <Icon awesome={'clone'} />
                    </Button>
                </Tooltip>
                <DropdownMenu
                    items={[
                        {
                            icon: <Icon awesome={'sort-alt'} />,
                            active: !current,
                            text: 'Unordered',
                            action: () => this.toggleKeyColumn(item, undefined),
                        },
                        {
                            icon: <Icon awesome={'sort-amount-up'} />,
                            active: current === DESCENDING,
                            text: 'Descending',
                            action: () => this.toggleKeyColumn(item, DESCENDING),
                        },
                        {
                            icon: <Icon awesome={'sort-amount-down-alt'} />,
                            active: current === ASCENDING,
                            text: 'Ascending',
                            action: () => this.toggleKeyColumn(item, ASCENDING),
                        },
                    ]}
                    switcher={
                        <Tooltip content={title}>
                            <Button view={'flat'}>
                                <Icon awesome={icon} className={block('sort-icon')} />
                            </Button>
                        </Tooltip>
                    }
                />
            </React.Fragment>
        );
    };

    onMoveTab = ({oldIndex, newIndex}: {oldIndex: number; newIndex: number}) => {
        const newTabItems = [...this.state.orderedTabItems];

        const itemToMove = newTabItems[oldIndex];
        newTabItems.splice(oldIndex, 1);
        newTabItems.splice(newIndex, 0, itemToMove);

        this.onOrderChanged(newTabItems, newIndex, oldIndex);
    };

    render() {
        const {activeTab, ...rest} = this.props;
        const {orderedTabItems} = this.state;

        return (
            <TabFieldVertical
                {...rest}
                activeTab={activeTab}
                tabItems={orderedTabItems}
                size={'m'}
                sortable={true}
                onOrderChanged={this.onMoveTab}
                wrapTo={this.renderKeyIcon}
            />
        );
    }
}

const mapDispatchToProps = {
    setKeyColumns: setCreateTableKeyColumns,
    setColumnsOrder: setCreateTableColumnsOrder,
};

const ColumnsWrapperConnected = connect(null, mapDispatchToProps)(ColumnsWrapper);

type TabFieldVerticalProps = React.ComponentProps<typeof TabFieldVertical>;

type Props = TabFieldVerticalProps;

export default class CreateTableTabField extends React.Component<Props> {
    static isTabControl = true as const;
    static isTabControlVertical = true;

    onAddColumn = (active = true, {duplicate}: {duplicate?: boolean} = {}) => {
        const {onCreateTab = () => {}} = this.props;
        onCreateTab('columns', active, {userOptions: {duplicate}});
    };

    renderAddColumnRow() {
        return (
            <div className={block('add-column')}>
                <span className={block('add-column-label')}>Columns</span>
                <Button onClick={() => this.onAddColumn()}>
                    <Icon awesome={'plus'} />
                    Add
                </Button>
            </div>
        );
    }

    render() {
        const {className, activeTab, tabItems, ...rest} = this.props;
        const [tableSettings, ...restItems] = tabItems;

        return (
            <div className={block(null, className)}>
                {this.renderAddColumnRow()}
                <ColumnsWrapperConnected
                    className={block('columns')}
                    {...rest}
                    tabItems={restItems}
                    activeTab={activeTab}
                    onAddColumn={this.onAddColumn}
                />
                <TabFieldVertical
                    className={block('table-settings')}
                    activeTab={activeTab}
                    tabItems={[tableSettings]}
                    {...rest}
                    virtualized={false}
                />
            </div>
        );
    }
}
