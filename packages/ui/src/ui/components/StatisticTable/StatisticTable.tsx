import React, {type ReactChild, type ReactNode, useCallback, useMemo, useState} from 'react';
import cn from 'bem-cn-lite';

import Icon from '../Icon/Icon';
import format from '../../common/hammer/format';
import ErrorBoundary from '../../containers/ErrorBoundary/ErrorBoundary';
import ElementsTableRow from '../ElementsTable/ElementsTable';
import {ExpandButton} from '../ExpandButton';
import {MetaTable, Secondary, Tooltip} from '@ytsaurus/components';

import i18n from './i18n';

import Toolbar from './Toolbar';
import {LEVEL_OFFSET} from './constants';
import {useNameColumnMinWidth} from './useNameColumnMinWidth';
import {filterStatisticTree, prepareStatisticTs} from './prepare-statistic.ts';
import {type Statistic, type StatisticTree, type TreeItem, type TreeState} from './types';

import {formatByUnit} from './utils';
import './StatisticTable.scss';

const block = cn('yt-statistics-table');

export type StatisticInfo = {
    description?: string;
    unit?: string;
};

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
    renderValue: (item: TreeItem) => ReactChild;
    minWidth?: number;
    info?: StatisticInfo;
}

export function StatisticName({title, info}: {title: ReactNode; info?: StatisticInfo}) {
    const emptyInfo = !info?.description && !info?.unit;

    return (
        <Tooltip
            content={
                emptyInfo ? null : (
                    <MetaTable
                        legacyGroupSpacing
                        items={[
                            {
                                key: 'description',
                                label: i18n('field_description'),
                                value: info.description,
                                visible: Boolean(info.description),
                                className: block('description'),
                            },
                            {
                                key: 'unit',
                                label: i18n('field_unit'),
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
                    <Icon awesome={'question-circle'} size={14} />
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
    const offsetStyle = useMemo(() => {
        return {minWidth, paddingLeft: (item?.level || 0) * LEVEL_OFFSET};
    }, [item.level, minWidth]);

    const toggleItemAndTreeState = useCallback(() => {
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
    ) => ReactChild | null;
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

const useJobStatisticTable = ({statistic}: {statistic: StatisticTree}) => {
    const [filter, setFilter] = useState('');
    const [treeState, setTreeState] = useState<TreeState>('expanded');

    const tree = useMemo(() => prepareStatisticTs(statistic), [statistic]);
    const items = useMemo(() => filterStatisticTree(tree, filter), [tree, filter]);
    const onFilterChange = (value: string) => setFilter(value);

    return {
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
    const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
    const {items, treeState, setTreeState, onFilterChange} = useJobStatisticTable({
        statistic,
    });
    const minWidth = useNameColumnMinWidth(items, rootElement);

    const templates = useMemo(
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
                            renderValue={(treeItem) => treeItem?.attributes?.name}
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
    const tableProps = useMemo(() => {
        return prepareTableProps({
            visibleColumns,
        });
    }, [...visibleColumns]);

    return (
        <ErrorBoundary>
            <div ref={setRootElement} className={block(null, className)}>
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
