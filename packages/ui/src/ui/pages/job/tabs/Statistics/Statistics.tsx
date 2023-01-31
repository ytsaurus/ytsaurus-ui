import React, {useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import ElementsTableRaw from '../../../../components/ElementsTable/ElementsTable';
import YTIcon from '../../../../components/Icon/Icon';
import Toolbar from './Toolbar';

import {StatisticsState} from '../../../../store/reducers/job/statistics';
import {
    getJobStatisticsMetricMinWidth,
    getTreeItems,
    LEVEL_OFFSET,
} from '../../../../store/selectors/job/statistics';
import {mixTable} from '../../../../store/actions/job/statistics';
import {JobTreeItem, LeafStatistic} from '../../../../types/job';
import {RootState} from '../../../../store/reducers';
import hammer from '../../../../common/hammer';

import './Statistics.scss';

interface ItemState {
    empty: boolean;
    collapsed: boolean;
    visible: boolean;
}

interface AvgProps {
    item: JobTreeItem;
}

interface MetricProps {
    item: JobTreeItem;
    itemState: ItemState;
    toggleItemState: Function;
    handleMix: Function;
    minWidth: number;
}

interface StatisticProps {
    item: JobTreeItem;
    aggregation: 'avg' | 'min' | 'max' | 'sum' | 'count' | 'last';
}

const block = cn('job-statistics');

const ElementsTable: any = ElementsTableRaw;
const Icon: any = YTIcon;

function Metric({item, itemState, toggleItemState, handleMix, minWidth}: MetricProps) {
    const offsetStyle = React.useMemo(() => {
        return {minWidth, paddingLeft: item.level * LEVEL_OFFSET};
    }, [item.level, minWidth]);
    const toggleItemAndTreeState = useCallback(() => {
        if (!itemState.empty) {
            toggleItemState();
            handleMix();
        }
    }, [itemState, toggleItemState, handleMix]);

    if (item.isLeafNode) {
        return (
            <span className={block('metric')} style={offsetStyle}>
                <Icon awesome="chart-line" className={block('metric-icon')} />

                <span>{item.attributes.name}</span>
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
                <span>{item.attributes.name}</span>
            </span>
        );
    }
}

function Avg({item}: AvgProps) {
    const statistic: LeafStatistic = item.attributes.value as LeafStatistic;

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

function Statistic({item, aggregation}: StatisticProps) {
    if (item.isLeafNode) {
        const statistic: LeafStatistic = item.attributes.value as LeafStatistic;

        if (aggregation === 'avg') {
            return <Avg item={item} />;
        } else {
            return hammer.format['Number'](statistic[aggregation]);
        }
    }

    return hammer.format.NO_VALUE;
}

const columns = {
    sets: {
        default: {
            items: ['metric', 'min', 'max', 'count', 'sum', 'last'],
        },
    },
    items: {
        metric: {
            sort: false,
            align: 'left',
        },
        min: {
            sort: false,
            align: 'right',
        },
        max: {
            sort: false,
            align: 'right',
        },
        last: {
            sort: false,
            align: 'right',
        },
        sum: {
            sort: false,
            align: 'right',
        },
        count: {
            sort: false,
            align: 'right',
        },
    },
    mode: 'default',
};

const tableProps = {
    columns,
    theme: 'light',
    size: 's',
    striped: false,
    tree: true,
    computeKey(item: JobTreeItem) {
        return item.name;
    },
};

export default function Statistics() {
    const dispatch = useDispatch();
    const {treeState}: StatisticsState = useSelector((state: RootState) => state.job.statistics);
    const items: JobTreeItem[] = useSelector(getTreeItems);
    const minWidth = useSelector(getJobStatisticsMetricMinWidth);

    const handleMix: Function = useCallback(() => dispatch(mixTable()), [dispatch]);

    const renderMetric: Function = useCallback(
        (item: JobTreeItem, _: never, toggleItemState: Function, itemState: ItemState) => (
            <Metric
                item={item}
                toggleItemState={toggleItemState}
                itemState={itemState}
                handleMix={handleMix}
                minWidth={minWidth}
            />
        ),
        [handleMix],
    );

    const templates = useMemo(
        () => ({
            metric: renderMetric,
            min(item: JobTreeItem) {
                return <Statistic item={item} aggregation="min" />;
            },
            max(item: JobTreeItem) {
                return <Statistic item={item} aggregation="max" />;
            },
            last(item: JobTreeItem) {
                return <Statistic item={item} aggregation="last" />;
            },
            sum(item: JobTreeItem) {
                return <Statistic item={item} aggregation="sum" />;
            },
            count(item: JobTreeItem) {
                return <Statistic item={item} aggregation="count" />;
            },
        }),
        [renderMetric],
    );

    return (
        <ErrorBoundary>
            <div className={block()}>
                <Toolbar />

                <div className={block('table-container')}>
                    <ElementsTable
                        {...tableProps}
                        treeState={treeState}
                        templates={templates}
                        items={items}
                        css={block()}
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
}
