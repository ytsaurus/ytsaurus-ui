import forEach_ from 'lodash/forEach';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import some_ from 'lodash/some';
import sortBy_ from 'lodash/sortBy';

import ypath from '../../../../common/thor/ypath';

function prepareGraphData(operation) {
    if (hasProgressTasks(operation)) {
        return prepareGraphDataByTasks(operation);
    }

    const dataFlowGraph = ypath.getValue(operation, '/@progress/data_flow_graph');
    const jobTypeOrder = ypath.getValue(dataFlowGraph, '/topological_ordering');
    const statistics = ypath.getValue(dataFlowGraph, '/edges');

    const data = [];

    if (dataFlowGraph) {
        forEach_(jobTypeOrder, (fromJobType) => {
            forEach_(statistics[fromJobType], (value, toJobType) => {
                data.push({
                    from: fromJobType,
                    to: toJobType,
                    value: value.statistics,
                });
            });
        });
    }

    return data;
}

function prepareGraphDataByTasks(operation) {
    const dataFlow = ypath.getValue(operation, '/@progress/data_flow');
    const tasks = ypath.getValue(operation, '/@progress/tasks');

    const res = reduce_(
        dataFlow,
        (acc, item) => {
            const {
                source_name: from,
                target_name: to,
                job_data_statistics,
                teleport_data_statistics,
            } = item;
            acc.push({
                from,
                to,
                info: item,
                value: keys_(job_data_statistics).reduce((acc, key) => {
                    const jobStat = ypath.getValue(job_data_statistics[key]);
                    const teleportStat = ypath.getValue(teleport_data_statistics[key]);
                    acc[key] = jobStat + teleportStat;
                    return acc;
                }, {}),
                job_data_statistics: isEmptyStatistics(job_data_statistics)
                    ? null
                    : job_data_statistics,
                teleport_data_statistics: isEmptyStatistics(teleport_data_statistics)
                    ? null
                    : teleport_data_statistics,
            });
            return acc;
        },
        [],
    );

    const tasksIndexMap = reduce_(
        tasks,
        (acc, {task_name}, index) => {
            acc[task_name] = index;
            return acc;
        },
        {},
    );

    return sortBy_(res, ({from}) => {
        if (from === 'input') {
            return -1;
        }
        return tasksIndexMap[from];
    });
}

function isEmptyStatistics(stats) {
    return !some_(stats, (value) => {
        return Boolean(ypath.getValue(value));
    });
}

export function prepareCompletedUsage(operation) {
    const progress = ypath.getValue(operation, '/@progress');

    if (progress) {
        let statistics = [];

        const estimatedInputStatistics = ypath.getValue(
            operation,
            '/@progress/estimated_input_statistics',
        );

        if (estimatedInputStatistics) {
            statistics.push({
                name: 'Estimated input',
                value: estimatedInputStatistics,
            });
        }

        statistics = statistics.concat(prepareGraphData(operation));

        return statistics;
    }
}

export function prepareIntermediateUsage(operation, intermediate) {
    return map_(intermediate, (resources, account) => ({
        ...resources,
        account,
    }));
}

export function hasProgressTasks(operation) {
    return ypath.getValue(operation, '/@progress/tasks');
}
