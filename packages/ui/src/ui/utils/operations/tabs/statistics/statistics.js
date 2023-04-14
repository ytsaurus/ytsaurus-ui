import _ from 'lodash';
import ypath from '../../../../common/thor/ypath';
import hammer from '../../../../common/hammer';
import {NAME_TERMINATOR, TREE_ROOT_NAME} from '../../../../constants/operations/statistics';

function createMetricsEntry(prefix, name) {
    return {
        name: name,
        prefix: prefix,
        path: prefix + '/' + name,
    };
}

function createMetricsEntryLeaf(prefix, name, statistics) {
    const entry = createMetricsEntry(prefix, name);

    entry.path += '/' + NAME_TERMINATOR;
    entry.value = statistics[NAME_TERMINATOR];

    return entry;
}

export function prepareMetricsList(statistics, list, prefix) {
    prefix = prefix || TREE_ROOT_NAME;

    list = list || {
        children: {},
        leaves: {},
    };

    _.each(statistics, (statistics, name) => {
        if (Object.hasOwnProperty.call(statistics, NAME_TERMINATOR)) {
            const metricsLeaf = createMetricsEntryLeaf(prefix, name, statistics);

            list.leaves[metricsLeaf.path] = metricsLeaf;
        } else {
            const metricsChild = createMetricsEntry(prefix, name);

            list.children[metricsChild.path] = metricsChild;

            list = prepareMetricsList(statistics, list, metricsChild.path);
        }
    });

    return list;
}

export function prepareMetricsTree(statistics) {
    const metricsList = prepareMetricsList(statistics);

    let metricsTree = hammer.treeList.prepareTree(metricsList.children, (entry) => entry.prefix);

    metricsTree = hammer.treeList.attachTreeLeaves(
        metricsTree,
        metricsList.leaves,
        (leafEntry) => leafEntry.prefix,
    );

    return metricsTree[TREE_ROOT_NAME];
}

function filteredMetricsTree(metricsTree, currentFilter) {
    if (metricsTree) {
        return hammer.treeList.filterTree(
            metricsTree,
            (entry) => entry.name.indexOf(currentFilter) !== -1,
            true,
        );
    }

    return metricsTree;
}

function sortedMetricsTree(metricsTree, currentFilter) {
    const metricsTreeRoot = filteredMetricsTree(metricsTree, currentFilter);

    if (metricsTreeRoot) {
        return hammer.treeList.sortTree(
            metricsTreeRoot,
            {field: 'name', asc: true},
            {
                name: {
                    get: function (entry) {
                        return entry.name;
                    },
                },
            },
        );
    }

    return metricsTreeRoot;
}

export function flatMetricsTree(metricsTree, currentFilter = '') {
    const metricTreeRoot = sortedMetricsTree(metricsTree, currentFilter);

    if (metricTreeRoot) {
        return hammer.treeList.flattenTree(metricTreeRoot);
    }
}

export function prepareStatistics(operation) {
    return ypath.getValue(operation, '/@progress/job_statistics');
}
