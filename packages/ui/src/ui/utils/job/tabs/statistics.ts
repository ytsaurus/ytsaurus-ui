import _ from 'lodash';
import ypath from '../../../common/thor/ypath';
import hammer from '../../../common/hammer';
import {TREE_ROOT_NAME} from '../../../constants/job';
import Job from '../../../pages/operations/OperationDetail/tabs/Jobs/job-selector';
import {
    JobStatistic,
    JobTree,
    LeafStatistic,
    MetricsEntry,
    MetricsEntryLeaf,
    MetricsList,
    RawJob,
} from '../../../types/job';

export function prepareStatistics(job: Job | RawJob): JobStatistic {
    // @ts-ignore
    return ypath.getValue(job, '/statistics');
}

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
    statistics: LeafStatistic,
): MetricsEntryLeaf {
    const entry: Partial<MetricsEntryLeaf> = createMetricsEntry(prefix, name);
    entry.value = statistics;

    return entry as MetricsEntryLeaf;
}

export function prepareMetricsList(
    statistics: object,
    list?: MetricsList,
    prefix: string = TREE_ROOT_NAME,
): MetricsList {
    let preparedList: MetricsList = list || {children: {}, leaves: {}};

    _.each(statistics, (statistic: object | LeafStatistic, name: string) => {
        if (typeof _.values(statistic)[0] === 'object') {
            const metricsChild: MetricsEntry = createMetricsEntry(prefix, name);

            preparedList.children[metricsChild.path] = metricsChild;

            preparedList = prepareMetricsList(statistic, preparedList, metricsChild.path);
        } else {
            const metricsLeaf: MetricsEntryLeaf = createMetricsEntryLeaf(
                prefix,
                name,
                statistic as LeafStatistic,
            );

            preparedList.leaves[metricsLeaf.path] = metricsLeaf;
        }
    });

    return preparedList;
}

export function prepareMetricsTree(statistics: JobStatistic): JobTree {
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
