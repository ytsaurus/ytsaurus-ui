import {createSelector} from 'reselect';
import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import min_ from 'lodash/min';
import max_ from 'lodash/max';
import reduce_ from 'lodash/reduce';
import sum_ from 'lodash/sum';

import {FieldTree, fieldTreeForEach, filterFieldTree} from '../../../common/hammer/field-tree';

import ypath from '../../../common/thor/ypath';
import {STATISTICS_FILTER_ALL_VALUE} from '../../../constants/operations/statistics';
import {RootState} from '../../../store/reducers';
import {ValueOf} from '../../../../@types/types';

const getJobTypeFilter = (state: RootState) => state.operations.statistics.jobTypeFilter;
const getPoolTreeFilter = (state: RootState) => state.operations.statistics.poolTreeFilter;

const getOperationDetailsOperation = (state: RootState) => state.operations.detail.operation;

export const getOperationStatisticsV2 = createSelector(
    [getOperationDetailsOperation],
    (operation) => {
        return ypath.getValue(operation, '/@progress/job_statistics_v2') as StatisticTreeRoot;
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

type JobState = 'completed' | 'running' | 'aborted' | 'failed' | 'lost';

type StatisticTree = FieldTree<Array<StatisticItem>>;

type StatisticTreeRoot = StatisticTree & {
    time?: StatisticTree & {total?: Array<StatisticItem>};
};

export function isStatisticItem(v: ValueOf<StatisticTree>): v is Array<StatisticItem> {
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
    [getJobTypeFilter, getPoolTreeFilter, getOperationStatisticsAvailableValues],
    (jobTypeFilter, poolTreeFilter, {job_type, pool_tree}) => {
        return {
            activeJobType:
                -1 === job_type.indexOf(jobTypeFilter)
                    ? STATISTICS_FILTER_ALL_VALUE
                    : jobTypeFilter,
            activePoolTree:
                -1 === pool_tree.indexOf(poolTreeFilter)
                    ? STATISTICS_FILTER_ALL_VALUE
                    : poolTreeFilter,
        };
    },
);

export const getOperationStatisticsFilteredTree = createSelector(
    [getOperationStatisticsActiveFilterValues, getOperationStatisticsV2],
    ({activeJobType, activePoolTree}, tree) => {
        if (!activeJobType && !activePoolTree) {
            return tree;
        }
        return filterFieldTree(
            tree,
            isStatisticItem,
            () => {
                return true;
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
