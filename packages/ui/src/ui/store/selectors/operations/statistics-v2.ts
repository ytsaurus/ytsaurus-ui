import {createSelector} from 'reselect';
import reduce from 'lodash/reduce';
import forEach from 'lodash/forEach';

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

interface StatisticItemSummary {
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

type JobState = 'completed' | 'running' | 'aborted' | 'failed' | 'list';

interface StatisticTree extends Record<string, StatisticTree | Array<StatisticItem> | undefined> {}

interface StatisticTreeRoot extends StatisticTree {
    time?: StatisticTree & {total?: Array<StatisticItem>};
}

export function isStatisticItem(v: ValueOf<StatisticTree>): v is Array<StatisticItem> {
    return Array.isArray(v);
}

export const getOperationStatisticsAvailableValues = createSelector(
    [getOperationStatisticsV2],
    (stats) => {
        const total = stats?.time?.total ?? [];
        const tmp = reduce(
            total,
            (acc, item) => {
                forEach(item.tags, (v, k) => {
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
        return reduce(
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
