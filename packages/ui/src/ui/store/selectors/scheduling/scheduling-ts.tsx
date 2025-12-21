import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import reduce_ from 'lodash/reduce';

import {createSelector} from 'reselect';
import {getCurrentPool, getIsRoot, getPool, getTree, getTreeResources} from './scheduling';

import ypath from '../../../common/thor/ypath';
import {ROOT_POOL_NAME} from '../../../constants/scheduling';
import {getCluster} from '../global';
import {getPools} from './scheduling-pools';

export const getSchedulingBreadcrumbItems = createSelector(
    [getPool, getPools],
    (pool: string, pools) => {
        let current: string | undefined = pool;
        const path = [];
        while (current) {
            path.push(current);
            const tmp: string = current;
            const {parent} = find_(pools, ({name}) => name === tmp) || {};
            current = parent;
        }
        return path.reverse();
    },
);

export interface PoolStaticConfigurationItem {
    name: string;
    cpu?: number;
    cpuLabel?: string;
    gpu?: number;
    memory?: number;
    user_slots?: number;
    network?: number;
}

function makeStaticConfigurationItem(name: string, attrs: object): PoolStaticConfigurationItem {
    return {
        name,
        cpu: ypath.getValue(attrs, '/cpu'),
        gpu: ypath.getValue(attrs, '/gpu'),
        memory: ypath.getValue(attrs, '/user_memory'),
        user_slots: ypath.getValue(attrs, '/user_slots'),
        network: ypath.getValue(attrs, '/network'),
    };
}

export const getCurrentPoolGuarantees = createSelector(
    [getIsRoot, getCurrentPool],
    (isRoot, data) => {
        if (isRoot || !data?.attributes) {
            return {};
        }

        const burst_guarantee_resources = ypath.getValue(
            data.attributes,
            '/specified_burst_guarantee_resources',
        );
        const resource_flow = ypath.getValue(data.attributes, '/specified_resource_flow');

        return {
            strong: makeStaticConfigurationItem(
                'Strong guarantee',
                ypath.getValue(data.attributes, '/strong_guarantee_resources'),
            ),
            burst: burst_guarantee_resources
                ? makeStaticConfigurationItem('Burst', burst_guarantee_resources)
                : undefined,
            flow: resource_flow ? makeStaticConfigurationItem('Flow', resource_flow) : undefined,
        };
    },
);

interface PoolTreeStaticConfigurationItem {
    name: string;
    total?: number;

    used?: number;
    usedTitle?: string;

    free?: number;
    format: 'Bytes' | 'Number';
    level?: number;

    lastDayMaxValueSensor?: 'max_operation_count' | 'max_running_operation_count';
    lastDayMaxValueTitle?: string;
}

function calcTreeStaticConfiguration(totals: any, undistributed: any, resourceType: any) {
    const total = ypath.getNumber(totals, '/' + resourceType, 0);
    const free = ypath.getNumber(undistributed, '/' + resourceType, 0);
    return {
        total,
        used: total - free,
        free,
    };
}

function calcTreeStaticConfigurationByDistributed(
    distributed: any,
    undistributed: any,
    resourceType: any,
) {
    const used = ypath.getNumber(distributed, '/' + resourceType, 0);
    const free = ypath.getNumber(undistributed, '/' + resourceType, 0);
    return {
        total: used + free,
        used,
        free,
    };
}

export const getPoolsTopLevel = createSelector([getPools], (pools) => {
    return filter_(pools, ({parent}) => parent === ROOT_POOL_NAME);
});

const getPoolsAllocatedOperationsCount = createSelector([getPoolsTopLevel], (topPools) => {
    return reduce_(
        topPools,
        (acc, item) => {
            acc.maxOperationCount += item.maxOperationCount || 0;
            acc.maxRunningOperationCount += item.maxRunningOperationCount || 0;
            return acc;
        },
        {maxOperationCount: 0, maxRunningOperationCount: 0},
    );
});

export const getCurrentTreeGpuLimit = createSelector([getTreeResources], (resources): number => {
    return ypath.getNumber(resources, '/resource_limits/gpu', 0);
});

export const getOperationsStaticConfiguration = createSelector(
    [getTreeResources, getPoolsAllocatedOperationsCount, getCluster, getTree],
    ({config}, allocated): Array<PoolTreeStaticConfigurationItem> => {
        const operationCount = ypath.getNumber(config, '/max_operation_count', 0);
        const runningOperationCount = ypath.getNumber(config, '/max_running_operation_count', 0);

        return [
            {
                name: 'Operations',
                format: 'Number',
            },
            {
                level: 1,
                name: 'Total',
                format: 'Number',
                total: operationCount,
                used: allocated.maxOperationCount,
                usedTitle: 'Max operation count',
                free: operationCount - allocated.maxOperationCount,

                lastDayMaxValueSensor: 'max_operation_count',
                lastDayMaxValueTitle: 'Last day max operations',
            },
            {
                level: 1,
                name: 'Running',
                format: 'Number',
                total: runningOperationCount,
                used: allocated.maxRunningOperationCount,
                usedTitle: 'Max running operation count',

                free: runningOperationCount - allocated.maxRunningOperationCount,

                lastDayMaxValueSensor: 'max_running_operation_count',
                lastDayMaxValueTitle: 'Last day max running operations',
            },
        ];
    },
);

export const getCurrentPoolTreeStaticConfiguration = createSelector(
    [getTreeResources, getOperationsStaticConfiguration],
    (treeResources = {}, operationRows): Array<PoolTreeStaticConfigurationItem> => {
        const {resource_distribution_info, resource_limits} = treeResources;

        if (!resource_distribution_info) {
            return [];
        }

        const {
            undistributed_resources,
            distributed_burst_guarantee_resources: burst,
            undistributed_burst_guarantee_resources: unburst,
            distributed_resource_flow: flow,
            undistributed_resource_flow: unflow,
        } = resource_distribution_info;

        const cpuRow: PoolTreeStaticConfigurationItem = {
            level: 0,
            name: 'CPU',
            format: 'Number',
            ...calcTreeStaticConfiguration(resource_limits, undistributed_resources, 'cpu'),
        };

        const burstRow: PoolTreeStaticConfigurationItem = {
            level: 1,
            name: 'Burst',
            format: 'Number',
            ...calcTreeStaticConfigurationByDistributed(burst, unburst, 'cpu'),
            total: undefined,
            free: undefined,
        };

        const flowRow: PoolTreeStaticConfigurationItem = {
            level: 1,
            name: 'Flow',
            format: 'Number',
            ...calcTreeStaticConfigurationByDistributed(flow, unflow, 'cpu'),
            total: undefined,
        };

        flowRow.free = burstRow.used! - flowRow.used!;

        const strong: PoolTreeStaticConfigurationItem = {
            level: 1,
            name: 'Strong',
            format: 'Number',
            used:
                cpuRow.used! -
                Math.max(...[0, burstRow.used!, flowRow.used!].filter((v) => !isNaN(v))),
        };

        return [
            cpuRow,
            strong,
            burstRow,
            flowRow,
            {
                name: 'Memory',
                format: 'Bytes',
                ...calcTreeStaticConfiguration(
                    resource_limits,
                    undistributed_resources,
                    'user_memory',
                ),
            },
            {
                name: 'GPU',
                format: 'Number',
                ...calcTreeStaticConfiguration(resource_limits, undistributed_resources, 'gpu'),
            },
            ...operationRows,
        ];
    },
);
