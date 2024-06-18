import * as React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import Icon from '../Icon/Icon';
import hammer from '../../common/hammer';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ElementsTableRow from '../ElementsTable/ElementsTable';
import {getFontFamilies} from '../../store/selectors/global/fonts';

import Toolbar from './Toolbar';
import {getMinWidth} from './get-min-width';
import {filterStatisticTree, prepareStatisticTs} from './prepare-statistic.ts';
import {Statistic, StatisticTree, TreeState} from './types';

import './Statistics.scss';

const block = cn('job-statistics');

export const LEVEL_OFFSET = 40;

interface TreeItem {
    name: string;
    level: number;
    attributes: {
        name: string;
        path: string;
        prefix: string;
        value?: Statistic;
    };
    isLeafNode?: boolean;
}

interface AvgProps {
    item: TreeItem;
}

function Avg({item}: AvgProps) {
    const statistic: Statistic = item.attributes.value as Statistic;

    if (statistic && statistic.count && statistic.sum) {
        const result: number = statistic.sum / statistic.count;

        if (result < 1) {
            return hammer.format['Number'](result, {significantDigits: 6});
        } else {
            return hammer.format.Number(result);
        }
    }

    return hammer.format.NO_VALUE;
}

interface StatisticProps {
    item: TreeItem;
    aggregation: 'avg' | 'min' | 'max' | 'sum' | 'count' | 'last';
}

function StatisticTableStaticCell({item, aggregation}: StatisticProps) {
    if (item.isLeafNode && Boolean(item.attributes.value)) {
        if (aggregation === 'avg') {
            return <Avg item={item} />;
        } else {
            return hammer.format['Number'](item.attributes?.value?.[aggregation]);
        }
    }

    return hammer.format.NO_VALUE;
}

interface ItemState {
    empty: boolean;
    collapsed: boolean;
    visible: boolean;
}

interface MetricProps {
    item: TreeItem;
    itemState: ItemState;
    toggleItemState: Function;
    renderValue: (item: TreeItem) => React.ReactChild;
    minWidth?: number;
}

export function ExpandedCell({
    item,
    itemState,
    toggleItemState,
    minWidth = undefined,
    renderValue,
}: MetricProps) {
    const offsetStyle = React.useMemo(() => {
        return {minWidth, paddingLeft: (item?.level || 0) * LEVEL_OFFSET};
    }, [item.level, minWidth]);

    const toggleItemAndTreeState = React.useCallback(() => {
        if (!itemState.empty) {
            toggleItemState();
        }
    }, [itemState, toggleItemState]);

    if (item.isLeafNode) {
        return (
            <span className={block('metric')} style={offsetStyle}>
                <Icon awesome="chart-line" className={block('metric-icon')} />

                <span>{renderValue(item)}</span>
            </span>
        );
    } else {
        return (
            <span className={block('group')} style={offsetStyle} onClick={toggleItemAndTreeState}>
                <Icon
                    awesome={itemState.collapsed || itemState.empty ? 'angle-down' : 'angle-up'}
                    className={block('group-icon-toggler')}
                />
                <Icon
                    awesome={itemState.collapsed || itemState.empty ? 'folder' : 'folder-open'}
                    className={block('group-icon')}
                />
                <span>{renderValue(item)}</span>
            </span>
        );
    }
}

type StatisticTableTemplate<Item extends Partial<TreeItem>> = {
    [name: string]: (
        item: Item,
        colName: string,
        toggleItemState: Function,
        itemState: ItemState,
    ) => React.ReactChild | null;
};

type ColumnName = 'avg' | 'min' | 'max' | 'sum' | 'count' | 'last';
type VisibleColumns = Array<ColumnName>;

const prepareTableProps = ({visibleColumns}: {visibleColumns: VisibleColumns}) => {
    const columns = visibleColumns.reduce(
        (ret, col) => {
            ret[col] = {
                sort: false,
                align: 'right',
            };

            return ret;
        },
        {
            name: {
                sort: false,
                align: 'left',
            },
        } as Record<ColumnName | 'name', {sort: boolean; align: 'left' | 'right'}>,
    );

    return {
        theme: 'light',
        size: 's',
        striped: false,
        computeKey(item: TreeItem) {
            return item.name;
        },
        tree: true,
        columns: {
            sets: {
                default: {
                    items: Object.keys(columns),
                },
            },
            items: columns,
            mode: 'default',
        },
    };
};

const useJobStatisticTable = ({
    statistic,
    fontFamilies,
}: {
    statistic: StatisticTree;
    fontFamilies: {regular: string; monospace: string};
}) => {
    const [filter, setFilter] = React.useState('');
    const [treeState, setTreeState] = React.useState<TreeState>('expanded');

    const tree = React.useMemo(() => prepareStatisticTs(statistic), [statistic]);
    const items = React.useMemo(() => filterStatisticTree(tree, filter), [tree, filter]);
    const minWidth = React.useMemo(() => getMinWidth(items, fontFamilies), [fontFamilies, items]);
    const onFilterChange = (value: string) => setFilter(value);

    return {
        minWidth,
        items,
        treeState,
        setTreeState,
        onFilterChange,
    };
};

export function StatisticTable({
    virtual,
    visibleColumns,
    fixedHeader,
    statistic,
}: {
    virtual?: boolean;
    fixedHeader?: boolean;
    statistic: StatisticTree;
    visibleColumns: Array<'avg' | 'min' | 'max' | 'sum' | 'count' | 'last'>;
}) {
    const fontFamilies = useSelector(getFontFamilies);
    const {items, minWidth, treeState, setTreeState, onFilterChange} = useJobStatisticTable({
        statistic,
        fontFamilies,
    });

    const templates = React.useMemo(
        () =>
            ({
                name(item, _, toggleItemState, itemState) {
                    return (
                        <ExpandedCell
                            item={item}
                            minWidth={minWidth}
                            toggleItemState={toggleItemState}
                            itemState={itemState}
                            renderValue={(item) => item?.attributes?.name}
                        />
                    );
                },
                __default__(item, columnName: ColumnName) {
                    if (item.isLeafNode) {
                        return <StatisticTableStaticCell item={item} aggregation={columnName} />;
                    }

                    return null;
                },
            } as StatisticTableTemplate<TreeItem>),
        [minWidth],
    );
    const tableProps = React.useMemo(() => {
        return prepareTableProps({
            visibleColumns,
        });
    }, [...visibleColumns]);

    return (
        <ErrorBoundary>
            <div className={block()}>
                <Toolbar
                    onFilterChange={onFilterChange}
                    onTreeStateChange={setTreeState}
                    treeState={treeState}
                />
                <div className={block('table-container')}>
                    <ElementsTableRow
                        {...tableProps}
                        virtual={virtual}
                        treeState={treeState}
                        templates={templates}
                        items={items}
                        css={block()}
                        headerClassName={block('header', {fixed: fixedHeader})}
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
}
