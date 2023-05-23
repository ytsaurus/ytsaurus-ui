import {createSelector} from 'reselect';
import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import get_ from 'lodash/get';
import isEmpty_ from 'lodash/isEmpty';
import min_ from 'lodash/min';
import map_ from 'lodash/map';
import max_ from 'lodash/max';
import reduce_ from 'lodash/reduce';
import sum_ from 'lodash/sum';

import {
    FieldTree,
    fieldTreeForEach,
    fieldTreeSome,
    filterFieldTree,
} from '../../../common/hammer/field-tree';
import format from '../../../common/hammer/format';

import ypath from '../../../common/thor/ypath';
import {STATISTICS_FILTER_ALL_VALUE} from '../../../constants/operations/statistics';
import {RootState} from '../../../store/reducers';
import {ValueOf} from '../../../../@types/types';
import {prepareDataFromGraph} from '../../../utils/operations/tabs/details/tasks';

const getJobTypeFilter = (state: RootState) => state.operations.statistics.jobTypeFilter;
const getPoolTreeFilter = (state: RootState) => state.operations.statistics.poolTreeFilter;
const getFilterText = (state: RootState) => state.operations.statistics.filterText;

const getOperationDetailsOperation = (state: RootState) => state.operations.detail.operation;

export const getOperationStatisticsV2 = createSelector(
    [getOperationDetailsOperation],
    (operation) => {
        return ypath.getValue(operation, '/@progress/job_statistics_v2') as
            | StatisticTreeRoot
            | undefined;
    },
);

interface StatisticItem {
    summary: StatisticItemSummary;
    tags: StatisticItemTags;
}

export interface StatisticItemSummary {
    min: number;
    max: number;
    sum: number;
    count: number;
}

interface StatisticItemTags {
    job_state: JobState;
    job_type: string;
    pool_tree: string;
}

export type JobState = 'completed' | 'running' | 'aborted' | 'failed' | 'lost';

type StatisticTree = FieldTree<Array<StatisticItem>>;

type StatisticTreeRoot = StatisticTree & {
    time?: StatisticTree & {total?: Array<StatisticItem>};
    data?: {
        input?: {
            data_weight?: Array<StatisticItem>;
            row_count?: Array<StatisticItem>;
        };
    };
};

export function isStatisticItem(v?: ValueOf<StatisticTree>): v is Array<StatisticItem> {
    return Array.isArray(v);
}

export const getOperationStatisticsAvailableValues = createSelector(
    [getOperationStatisticsV2],
    (stats) => {
        const total = stats?.time?.total ?? [];
        const tmp = reduce_(
            total,
            (acc, item) => {
                forEach_(item.tags, (v, k) => {
                    const key = k as keyof typeof acc;
                    if (v) {
                        if (!acc[key]) {
                            acc[key] = new Set();
                        }
                        acc[key].add(v);
                    }
                });
                return acc;
            },
            {} as Record<keyof Partial<Omit<StatisticItemTags, 'job_state'>>, Set<string>>,
        );
        return reduce_(
            tmp,
            (acc, v, k) => {
                const key = k as keyof typeof acc;
                acc[key] = new Array(...v.values());
                return acc;
            },
            {} as Record<keyof typeof tmp, Array<string>>,
        );
    },
);

export const getOperationStatisticsActiveFilterValues = createSelector(
    [getJobTypeFilter, getPoolTreeFilter, getFilterText, getOperationStatisticsAvailableValues],
    (jobTypeFilter, poolTreeFilter, filterText, {job_type, pool_tree}) => {
        return {
            activeJobType:
                -1 === job_type.indexOf(jobTypeFilter)
                    ? STATISTICS_FILTER_ALL_VALUE
                    : jobTypeFilter,
            activePoolTree:
                -1 === pool_tree.indexOf(poolTreeFilter)
                    ? STATISTICS_FILTER_ALL_VALUE
                    : poolTreeFilter,
            filterText,
        };
    },
);

export const getOperationStatiscsHasData = (state: RootState) => {
    return !isEmpty_(getOperationStatisticsV2(state));
};

export const getOperationStatisticsFilteredTree = createSelector(
    [getOperationStatisticsActiveFilterValues, getOperationStatisticsV2],
    ({activeJobType, activePoolTree, filterText}, tree) => {
        if (!activeJobType && !activePoolTree && !filterText) {
            return tree;
        }

        const checkByName = !filterText.length
            ? () => true
            : (path: Array<string>) => {
                  const pathText = path.join('/');
                  return -1 !== pathText.indexOf(filterText);
              };

        return filterFieldTree(
            tree ?? {},
            isStatisticItem,
            (path, tree) => {
                if (checkByName(path)) {
                    return true;
                }
                return tree && fieldTreeSome(tree, isStatisticItem, checkByName, path.slice());
            },
            (items) => {
                return filter_(items, ({tags: {job_type, pool_tree}}) => {
                    if (activeJobType && job_type !== activeJobType) {
                        return false;
                    }
                    if (activePoolTree && pool_tree !== activePoolTree) {
                        return false;
                    }
                    return true;
                });
            },
        );
    },
);

export const getOperationStatisticsFiltered = createSelector(
    [getOperationStatisticsFilteredTree],
    (tree) => {
        const res: Array<{
            name: string;
            title: string;
            level: number;
            data?: Partial<Record<JobState, StatisticItemSummary>>;
            isLeafNode?: boolean;
        }> = [];
        fieldTreeForEach(tree ?? {}, isStatisticItem, (path, _tree, item) => {
            const isLeafNode = Boolean(item);
            res.push({
                title: path[path.length - 1],
                level: path.length - 1,
                data: item ? itemToRow(item) : undefined,
                isLeafNode,
                name: path.join('/'),
            });
        });
        return res;
    },
);

function itemToRow(items: Array<StatisticItem>) {
    const res: Partial<Record<JobState, StatisticItemSummary>> = {};
    forEach_(items, ({summary, tags: {job_state}}) => {
        res[job_state] = mergeSummary(summary, res[job_state]);
    });
    return res;
}

function mergeSummary(summary: StatisticItemSummary, current?: StatisticItemSummary) {
    if (!current) {
        return summary;
    }

    const c = sum_([summary.count, current.count])!;
    const s = sum_([summary.sum, current?.sum]);
    return {
        min: min_([summary.min, current.min])!,
        max: max_([summary.max, current.max])!,
        count: c,
        sum: s,
    };
}

export const getTotalJobWallTime = createSelector(getOperationStatisticsV2, (tree) => {
    const item = tree?.time?.total;
    return excludeRunningAndCalcSum(item);
});

function excludeRunningAndCalcSum(item?: Array<StatisticItem>) {
    const {running: _tmp, ...rest} = itemToRow(item ?? []);
    const valuesToSum = compact_(map_(rest, 'sum'));
    return !valuesToSum.length ? format.NO_VALUE : sum_(valuesToSum);
}

const CPU_TIME_SPENT_PART_NAMES = [
    'job_proxy.cpu.user',
    'job_proxy.cpu.system',
    'user_job.cpu.user',
    'user_job.cpu.system',
];

export const getTotalCpuTimeSpent = createSelector([getOperationStatisticsV2], (tree) => {
    const items = reduce_(
        CPU_TIME_SPENT_PART_NAMES,
        (acc, path) => {
            const item = get_(tree, path);
            if (isStatisticItem(item)) {
                const value = excludeRunningAndCalcSum(item);
                if (value !== undefined) {
                    acc.push(value);
                }
            }
            return acc;
        },
        [] as Array<number>,
    );
    return items.length ? sum_(items) : format.NO_VALUE;
});

export const getOperationDetailTasksData = createSelector(
    [getOperationDetailsOperation, getOperationStatisticsV2],
    (operation, stats) => {
        const items = prepareDataFromGraph(operation);

        const {running: _r, ...timeStatistics} = itemToRow(stats?.time?.total ?? []);

        const abortedJobsTime = timeStatistics.aborted?.sum;
        const completedJobsTime = timeStatistics.completed?.sum;

        const abortedJobsTimeRatio = prepareAbortedJobsTimeRatio(
            abortedJobsTime,
            completedJobsTime,
        );

        const averageReadDataRate = prepareAverageReadDataRate(stats || {}, completedJobsTime);
        const averageReadRowRate = prepareAverageReadRowRate(stats || {}, completedJobsTime);

        if (
            !timeStatistics &&
            !abortedJobsTime &&
            !completedJobsTime &&
            !abortedJobsTimeRatio &&
            !averageReadDataRate &&
            !averageReadDataRate &&
            items.length === 0
        ) {
            return {items: []};
        }

        return {
            items,
            abortedJobsTime,
            completedJobsTime,
            abortedJobsTimeRatio,
            averageReadDataRate,
            averageReadRowRate,
        };
    },
);

function prepareAbortedJobsTimeRatio(abortedJobsTime?: number, completedJobsTime?: number) {
    let abortedJobsShare;

    if (typeof completedJobsTime !== 'undefined' && typeof abortedJobsTime !== 'undefined') {
        if (abortedJobsTime > 0 && completedJobsTime > 0) {
            abortedJobsShare = (abortedJobsTime / completedJobsTime) * 100;
        } else if (abortedJobsTime > 0) {
            abortedJobsShare = 100;
        } else if (completedJobsTime > 0) {
            abortedJobsShare = 0;
        }
    }

    return abortedJobsShare;
}

function prepareAverageReadDataRate(stats: StatisticTreeRoot, completedJobsTime = NaN) {
    const completedInputSize = itemToRow(stats?.data?.input?.data_weight || []).completed?.sum ?? 0;

    return completedInputSize > 0 ? completedInputSize / (completedJobsTime / 1000) : undefined;
}

function prepareAverageReadRowRate(stats: StatisticTreeRoot, completedJobsTime = NaN) {
    const completedInputRows = itemToRow(stats?.data?.input?.row_count || []).completed?.sum ?? 0;

    return completedJobsTime > 0 ? completedInputRows / (completedJobsTime / 1000) : undefined;
}
