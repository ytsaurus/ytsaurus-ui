import _ from 'lodash';
import ypath from '../../../../common/thor/ypath';
import hammer from '../../../../common/hammer';
import {hasProgressTasks} from './data-flow';
import {prepareTableColumns} from '../../../../utils/index';

function sortCounters(reasonA, reasonB) {
    return hammer.utils.compareVectors(
        [reasonA.key === 'other' ? 1 : -1, reasonA.key],
        [reasonB.key === 'other' ? 1 : -1, reasonB.key],
        'asc',
    );
}

function prepareCategoryCounters(counters, category) {
    if (typeof counters[category] === 'object') {
        const prepared = _.reduce(
            counters[category],
            (statistics, count, key) => {
                statistics.counters.push({
                    value: count,
                    key: key,
                });
                statistics.total += count;

                return statistics;
            },
            {
                counters: [],
                total: 0,
            },
        );

        prepared.counters.sort(sortCounters);

        return prepared;
    } else {
        return {
            total: counters[category],
        };
    }
}

function prepareCompletedStatistics(counters) {
    const completed = counters.completed;

    return {
        interrupted: prepareCategoryCounters(completed, 'interrupted'),
        nonInterrupted: prepareCategoryCounters(completed, 'non-interrupted'), // XXX API NAMING BUG
        total: completed['total'],
    };
}

function prepareAbortedStatistics(counters) {
    const aborted = counters.aborted;

    return {
        scheduled: prepareCategoryCounters(aborted, 'scheduled'),
        nonScheduled: prepareCategoryCounters(aborted, 'non_scheduled'),
        total: aborted['total'],
    };
}

function prepareJobTypeOrder(jobTypeOrder) {
    const SOURCE = 'source';
    const SINK = 'sink';

    // REMOVE source, sink
    jobTypeOrder = _.filter(jobTypeOrder, (jobType) => {
        const type = String(jobType).toLowerCase();
        return type !== SOURCE && type !== SINK;
    });
    // ADD total
    jobTypeOrder.push('total');

    return jobTypeOrder;
}

function prepareDataFromGraph(operation) {
    if (hasProgressTasks(operation)) {
        return prepareDataFromGraphByTasks(operation);
    }

    const dataFlowGraph = ypath.getValue(operation, '/@progress/data_flow_graph');
    let jobTypeOrder = ypath.getValue(dataFlowGraph, '/topological_ordering');
    const countersByType = ypath.getValue(dataFlowGraph, '/vertices');
    let data = [];

    if (dataFlowGraph) {
        jobTypeOrder = prepareJobTypeOrder(jobTypeOrder);

        // In case of inconsistent graph data
        jobTypeOrder = _.filter(jobTypeOrder, (jobType) => {
            return typeof countersByType[jobType] !== 'undefined';
        });

        data = _.map(jobTypeOrder, (taskType) => {
            return {
                type: taskType,
                jobType: taskType === 'total' ? taskType : countersByType[taskType].job_type,
                counters: countersByType[taskType].job_counter,
            };
        });

        data = _.map(data, (jobTypeInfo) => {
            const type = jobTypeInfo.type;
            const counters = jobTypeInfo.counters;
            return {
                type: type,
                caption: type,
                jobType: jobTypeInfo.jobType,
                ...prepareCounters(counters),
            };
        });
    }

    return data;
}

function prepareDataFromGraphByTasks(operation) {
    const tasks = ypath.getValue(operation, '/@progress/tasks');

    const res = _.map(tasks, (task) => {
        const {task_name, job_type, job_counter} = task;
        return {
            type: task_name,
            caption: task_name,
            jobType: job_type,
            ...prepareCounters(job_counter),
            info: task,
        };
    });

    const totalCounters = ypath.getValue(operation, '/@progress/total_job_counter');
    res.push({
        type: 'total',
        caption: 'total',
        jobType: 'total',
        ...prepareCounters(totalCounters),
        info: totalCounters,
        isTotal: true,
    });

    return res;
}

function prepareCounters(counters) {
    return {
        counters,
        abortedStats: prepareAbortedStatistics(counters),
        completedStats: prepareCompletedStatistics(counters),
    };
}

function mergeStatsByJobType(stats, condition) {
    const resultingStat = {
        max: -Infinity,
        count: 0,
        min: Infinity,
        sum: 0,
        avg: 0,
    };

    _.each(stats, (value, jobType) => {
        if (typeof condition !== 'function' || condition(jobType)) {
            resultingStat.min = Math.min(resultingStat.min, value.min);
            resultingStat.max = Math.max(resultingStat.max, value.max);
            resultingStat.count += value.count;
            resultingStat.sum += value.sum;
            // Add computed aggregator 'avg' for group
            resultingStat.avg = resultingStat.count && resultingStat.sum / resultingStat.count;
        }
    });

    return resultingStat;
}

function prepareAbortedJobsTimeRatio(abortedJobsTime, completedJobsTime) {
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

function prepareAverageReadDataRate(operation, completedJobsTime) {
    const dataStatistics = ypath.getValue(
        operation,
        '/@progress/job_statistics/data/input/data_weight/$$',
    );

    const completedInputSize = dataStatistics && mergeStatsByJobType(dataStatistics.completed).sum;

    return completedJobsTime > 0 ? completedInputSize / (completedJobsTime / 1000) : undefined;
}

function prepareAverageReadRowRate(operation, completedJobsTime) {
    const rowStatistics = ypath.getValue(
        operation,
        '/@progress/job_statistics/data/input/row_count/$$',
    );
    const completedInputRows = rowStatistics && mergeStatsByJobType(rowStatistics.completed).sum;

    return completedJobsTime > 0 ? completedInputRows / (completedJobsTime / 1000) : undefined;
}

export function prepareJobs(operation) {
    const items = prepareDataFromGraph(operation);

    const timeStatistics = ypath.getValue(operation, '/@progress/job_statistics/time/total/$$');
    const abortedJobsTime = timeStatistics && mergeStatsByJobType(timeStatistics.aborted).sum;
    const completedJobsTime = timeStatistics && mergeStatsByJobType(timeStatistics.completed).sum;
    const abortedJobsTimeRatio = prepareAbortedJobsTimeRatio(abortedJobsTime, completedJobsTime);

    const averageReadDataRate = prepareAverageReadDataRate(operation, completedJobsTime);
    const averageReadRowRate = prepareAverageReadRowRate(operation, completedJobsTime);

    if (
        !timeStatistics &&
        !abortedJobsTime &&
        !completedJobsTime &&
        !abortedJobsTimeRatio &&
        !averageReadDataRate &&
        !averageReadDataRate &&
        items.length === 0
    ) {
        return null;
    }

    return {
        items,
        timeStatistics,
        abortedJobsTime,
        completedJobsTime,
        abortedJobsTimeRatio,
        averageReadDataRate,
        averageReadRowRate,
    };
}

function prepareColumns() {
    const states = ['total', 'pending', 'running', 'completed', 'failed', 'aborted', 'lost'];

    const columns = {
        job_type: {
            sort: false,
            align: 'left',
            caption: 'Task',
        },
    };

    _.each(states, (state) => {
        columns[state] = {
            sort: false,
            align: 'right',
        };
    });

    columns.actions = {
        name: 'actions',
        sort: 'false',
        caption: '',
    };

    return {
        items: prepareTableColumns(columns),
        sets: {
            default: {
                items: ['job_type'].concat(states),
            },
            withActions: {
                items: _.map(columns, (_x, name) => name),
            },
        },
        mode: 'default',
    };
}

export const tasksTablesProps = {
    theme: 'light',
    striped: false,
    virtual: false,
    size: 'm',
    columns: prepareColumns(),
    computeKey(item) {
        return item.type;
    },
};
