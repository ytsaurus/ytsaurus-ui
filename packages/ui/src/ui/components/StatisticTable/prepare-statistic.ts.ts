import _ from 'lodash';
import hammer from '../../common/hammer';
import {
    MetricsEntry,
    MetricsEntryLeaf,
    MetricsList,
    Statistic,
    StatisticTree,
    StatisticTreeInner,
} from './types';

const TREE_ROOT_NAME = '<Root>';

function createMetricsEntry(prefix: string, name: string): MetricsEntry {
    return {
        name: name,
        prefix: prefix,
        path: prefix + '/' + name,
    };
}

function createMetricsEntryLeaf(
    prefix: string,
    name: string,
    statistics: Statistic,
): MetricsEntryLeaf {
    const entry: Partial<MetricsEntryLeaf> = createMetricsEntry(prefix, name);
    entry.value = statistics;

    return entry as MetricsEntryLeaf;
}

function prepareMetricsList(
    statistics: object,
    list?: MetricsList,
    prefix: string = TREE_ROOT_NAME,
): MetricsList {
    let preparedList: MetricsList = list || {children: {}, leaves: {}};

    _.each(statistics, (statistic: object | Statistic, name: string) => {
        if (typeof _.values(statistic)[0] === 'object') {
            const metricsChild: MetricsEntry = createMetricsEntry(prefix, name);

            preparedList.children[metricsChild.path] = metricsChild;

            preparedList = prepareMetricsList(statistic, preparedList, metricsChild.path);
        } else {
            const metricsLeaf: MetricsEntryLeaf = createMetricsEntryLeaf(
                prefix,
                name,
                statistic as Statistic,
            );

            preparedList.leaves[metricsLeaf.path] = metricsLeaf;
        }
    });

    return preparedList;
}

export function prepareMetricsTree(statistics: StatisticTree): StatisticTreeInner {
    const metricsList: MetricsList = prepareMetricsList(statistics);

    let metricsTree = hammer.treeList.prepareTree(
        metricsList.children,
        (entry: MetricsEntry) => entry.prefix,
    );

    metricsTree = hammer.treeList.attachTreeLeaves(
        metricsTree,
        metricsList.leaves,
        (leafEntry: MetricsEntryLeaf) => leafEntry.prefix,
    );

    return metricsTree[TREE_ROOT_NAME];
}

export function filterStatisticTree(tree: StatisticTreeInner, currentFilter = '') {
    const filteredTree = hammer.treeList.filterTree(
        tree,
        (entry: MetricsEntry) => entry.name.indexOf(currentFilter) !== -1,
        true,
    );

    const sortedTree = hammer.treeList.sortTree(
        filteredTree,
        {field: 'name', asc: true},
        {
            name: {
                get: function (entry: MetricsEntry) {
                    return entry.name;
                },
            },
        },
    );

    return hammer.treeList.flattenTree(sortedTree);
}

export const prepareStatisticTs = (statistic: StatisticTree) => {
    return prepareMetricsTree(statistic);
};
