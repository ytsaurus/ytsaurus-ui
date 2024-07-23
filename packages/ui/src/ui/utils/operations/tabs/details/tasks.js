import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

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
        const prepared = reduce_(
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
    jobTypeOrder = filter_(jobTypeOrder, (jobType) => {
        const type = String(jobType).toLowerCase();
        return type !== SOURCE && type !== SINK;
    });
    // ADD total
    jobTypeOrder.push('total');

    return jobTypeOrder;
}

export function prepareDataFromGraph(operation) {
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
        jobTypeOrder = filter_(jobTypeOrder, (jobType) => {
            return typeof countersByType[jobType] !== 'undefined';
        });

        data = map_(jobTypeOrder, (taskType) => {
            return {
                type: taskType,
                jobType: taskType === 'total' ? taskType : countersByType[taskType].job_type,
                counters: countersByType[taskType].job_counter,
            };
        });

        data = map_(data, (jobTypeInfo) => {
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

    const res = map_(tasks, (task) => {
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

function prepareColumns() {
    const states = ['total', 'pending', 'running', 'completed', 'failed', 'aborted', 'lost'];

    const columns = {
        job_type: {
            sort: false,
            align: 'left',
            caption: 'Task',
        },
    };

    forEach_(states, (state) => {
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
                items: map_(columns, (_x, name) => name),
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
