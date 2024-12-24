import * as React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import Icon from '../Icon/Icon';
import format from '../../common/hammer/format';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ElementsTableRow from '../ElementsTable/ElementsTable';
import {ExpandButton} from '../ExpandButton';
import {getFontFamilies} from '../../store/selectors/global/fonts';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import MetaTable from '../../components/MetaTable/MetaTable';
import {Secondary} from '../../components/Text/Text';

import Toolbar from './Toolbar';
import {getMinWidth} from './get-min-width';
import {filterStatisticTree, prepareStatisticTs} from './prepare-statistic.ts';
import {Statistic, StatisticTree, TreeState} from './types';

import {formatByUnit} from './utils';
import './StatisticTable.scss';

const block = cn('yt-statistics-table');

export const LEVEL_OFFSET = 40;

export type StatisticInfo = {
    description?: string;
    unit?: string;
};

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
    unit?: string;
}

function Avg({item, unit}: AvgProps) {
    const statistic: Statistic = item.attributes.value as Statistic;

    if (statistic && statistic.count && statistic.sum) {
        const result: number = statistic.sum / statistic.count;

        if (result < 1) {
            return formatByUnit(result, unit, {significantDigits: 6});
        } else {
            return formatByUnit(result, unit);
        }
    }

    return format.NO_VALUE;
}

interface StatisticProps {
    item: TreeItem;
    aggregation: 'avg' | 'min' | 'max' | 'sum' | 'count' | 'last';
    unit?: string;
}

function StatisticTableStaticCell({item, aggregation, unit}: StatisticProps) {
    if (item.isLeafNode && Boolean(item.attributes.value)) {
        if (aggregation === 'avg') {
            return <Avg item={item} unit={unit} />;
        } else if (aggregation === 'count') {
            return format['Number'](item.attributes?.value?.[aggregation]);
        } else {
            return formatByUnit(item.attributes?.value?.[aggregation], unit);
        }
    }

    return format.NO_VALUE;
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
    info?: StatisticInfo;
}

export function StatisticName({title, info}: {title: React.ReactNode; info?: StatisticInfo}) {
    const emptyInfo = !info?.description && !info?.unit;

    return (
        <Tooltip
            content={
                emptyInfo ? null : (
                    <MetaTable
                        items={[
                            {
                                key: 'Description',
                                value: info.description,
                                visible: Boolean(info.description),
                                className: block('description'),
                            },
                            {
                                key: 'Unit',
                                value: info.unit,
                                visible: Boolean(info.unit),
                            },
                        ]}
                    />
                )
            }
        >
            {title}{' '}
            {!emptyInfo && (
                <Secondary>
                    <Icon awesome={'question-circle'} />
                </Secondary>
            )}
        </Tooltip>
    );
}

export function ExpandedCell({
    item,
    itemState,
    toggleItemState,
    minWidth = undefined,
    renderValue,
    info,
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

                <StatisticName title={renderValue(item)} info={info} />
            </span>
        );
    } else {
        return (
            <span className={block('group')} style={offsetStyle} onClick={toggleItemAndTreeState}>
                <ExpandButton
                    expanded={!(itemState.collapsed || itemState.empty)}
                    toggleExpanded={() => {}}
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
    className,
    helpUrl,
    virtual,
    visibleColumns,
    fixedHeader,
    statistic,
    getStatisticInfo,
}: {
    className?: string;
    helpUrl?: string;
    virtual?: boolean;
    fixedHeader?: boolean;
    statistic: StatisticTree;
    visibleColumns: Array<'avg' | 'min' | 'max' | 'sum' | 'count' | 'last'>;
    getStatisticInfo?: (name: string) => StatisticInfo | undefined;
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
                    const info = getStatisticInfo?.(item.name) ?? {};
                    return (
                        <ExpandedCell
                            item={item}
                            minWidth={minWidth}
                            toggleItemState={toggleItemState}
                            itemState={itemState}
                            renderValue={(item) => item?.attributes?.name}
                            info={info}
                        />
                    );
                },
                __default__(item, columnName: ColumnName) {
                    if (item.isLeafNode) {
                        const {unit} = getStatisticInfo?.(item.name) ?? {};
                        return (
                            <StatisticTableStaticCell
                                item={item}
                                aggregation={columnName}
                                unit={unit}
                            />
                        );
                    }

                    return null;
                },
            }) as StatisticTableTemplate<TreeItem>,
        [minWidth, getStatisticInfo],
    );
    const tableProps = React.useMemo(() => {
        return prepareTableProps({
            visibleColumns,
        });
    }, [...visibleColumns]);

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Toolbar
                    helpUrl={helpUrl}
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
