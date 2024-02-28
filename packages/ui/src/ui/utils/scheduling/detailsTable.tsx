import React from 'react';

import format from '../../common/hammer/format';
import SchedulingOperationsLoader from '../../pages/scheduling/Content/tabs/ScherdulingOperataionsLoader/SchedulingOperationsLoader';
import {PoolInfo, PoolResourceType} from '../../store/selectors/scheduling/scheduling-pools';

function prepareDetailedColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo) {
            return item.resources?.[resource]?.detailed;
        },
        sort: true,
        caption: 'Abs fair share',
        align: 'right',
    };
}

function prepareLimitColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo) {
            return item.resources?.[resource]?.limit;
        },
        sort: true,
        sortWithUndefined: true,
        caption: 'Limit',
        align: 'right',
    };
}

function prepareMinResourcesColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo) {
            return item.resources?.[resource]?.min;
        },
        sort: true,
        caption: 'Strong guar.',
        title: 'Strong guarantee',
        align: 'right',
    };
}

function prepareAbsGuaranteedColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo) {
            return item.resources?.[resource]?.guaranteed;
        },
        sort: true,
        caption: 'Estimated guar.',
        title: 'Estimated guarantee',
        align: 'right',
    };
}

function prepareRelGuaranteedColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo, currentPool: PoolInfo) {
            return (
                prepareAbsGuaranteedColumn(resource).get(item)! /
                prepareAbsGuaranteedColumn(resource).get(currentPool)!
            );
        },
        sort: true,
        caption: 'Rel guaranteed',
        align: 'right',
    };
}

function prepareAbsDemandColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo) {
            return item.resources?.[resource]?.demand;
        },
        sort: true,
        caption: 'Abs demand',
        align: 'right',
    };
}

function prepareAbsUsageColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo) {
            return item.resources?.[resource]?.usage;
        },
        sort: true,
        caption: 'Abs usage',
        align: 'right',
    };
}

function prepareRelUsageColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo, currentPool: PoolInfo) {
            return (
                prepareAbsUsageColumn(resource).get(item)! /
                prepareAbsUsageColumn(resource).get(currentPool)!
            );
        },
        sort: true,
        caption: 'Rel usage',
        align: 'right',
    };
}

function prepareGuaranteedUsageColumn(resource: PoolResourceType) {
    return {
        get(item: PoolInfo, currentPool: PoolInfo) {
            return {
                guaranteed: prepareRelGuaranteedColumn(resource).get(item, currentPool),
                usage: prepareRelUsageColumn(resource).get(item, currentPool),
            };
        },
        caption: 'Usage / Guaranteed',
        align: 'center',
    };
}

export const childTableItems = {
    name: {
        sort(item: PoolInfo) {
            return item.name;
        },
        caption: 'Pool / Operation',
        captionTail: <SchedulingOperationsLoader />,
        align: 'left',
    },
    mode: {
        sort(item: PoolInfo) {
            return item.mode;
        },
        align: 'center',
    },
    FI: {
        sort(item: PoolInfo) {
            return item.fifoIndex;
        },
        align: 'center',
    },
    weight: {
        sort(item: PoolInfo) {
            return item.weight;
        },
        align: 'right',
    },
    min_share: {
        sort(item: PoolInfo) {
            return item.minShareRatio;
        },
        align: 'right',
    },
    max_share: {
        sort(item: PoolInfo) {
            return item.maxShareRatio;
        },
        align: 'right',
    },
    fair_share: {
        get(item: PoolInfo) {
            return item.fairShareRatio;
        },
        sort: true,
        align: 'right',
    },
    usage: {
        get(item: PoolInfo) {
            return item.usageRatio;
        },
        sort: true,
        align: 'right',
    },
    demand: {
        get(item: PoolInfo) {
            return item.demandRatio;
        },
        sort: true,
        align: 'right',
    },
    fair_share_usage: {
        caption: 'Usage / Fair share',
        align: 'left',
    },
    dominant_resource: {
        sort(item: PoolInfo) {
            return item.dominantResource;
        },
        caption: 'Dom. res.',
        title: 'Dominant Resource',
        align: 'left',
    },

    resource_detailed_cpu: prepareDetailedColumn('cpu'),
    resource_detailed_memory: prepareDetailedColumn('user_memory'),
    resource_detailed_gpu: prepareDetailedColumn('gpu'),
    resource_detailed_user_slots: prepareDetailedColumn('user_slots'),

    resource_limit_cpu: prepareLimitColumn('cpu'),
    resource_limit_memory: prepareLimitColumn('user_memory'),
    resource_limit_gpu: prepareLimitColumn('gpu'),
    resource_limit_user_slots: prepareLimitColumn('user_slots'),

    min_resources_cpu: prepareMinResourcesColumn('cpu'),
    min_resources_memory: prepareMinResourcesColumn('user_memory'),
    min_resources_gpu: prepareMinResourcesColumn('gpu'),
    min_resources_user_slots: prepareMinResourcesColumn('user_slots'),

    abs_guaranteed_cpu: prepareAbsGuaranteedColumn('cpu'),
    abs_guaranteed_memory: prepareAbsGuaranteedColumn('user_memory'),
    abs_guaranteed_gpu: prepareAbsGuaranteedColumn('gpu'),
    abs_guaranteed_user_slots: prepareAbsGuaranteedColumn('user_slots'),

    rel_guaranteed_cpu: prepareRelGuaranteedColumn('cpu'),
    rel_guaranteed_memory: prepareRelGuaranteedColumn('user_memory'),
    rel_guaranteed_gpu: prepareRelGuaranteedColumn('gpu'),
    rel_guaranteed_user_slots: prepareRelGuaranteedColumn('user_slots'),

    abs_usage_cpu: prepareAbsUsageColumn('cpu'),
    abs_usage_memory: prepareAbsUsageColumn('user_memory'),
    abs_usage_gpu: prepareAbsUsageColumn('gpu'),
    abs_usage_user_slots: prepareAbsUsageColumn('user_slots'),

    abs_demand_cpu: prepareAbsDemandColumn('cpu'),
    abs_demand_memory: prepareAbsDemandColumn('user_memory'),
    abs_demand_gpu: prepareAbsDemandColumn('gpu'),
    abs_demand_user_slots: prepareAbsDemandColumn('user_slots'),

    rel_usage_cpu: prepareRelUsageColumn('cpu'),
    rel_usage_memory: prepareRelUsageColumn('user_memory'),
    rel_usage_gpu: prepareRelUsageColumn('gpu'),
    rel_usage_user_slots: prepareRelUsageColumn('user_slots'),

    guaranteed_usage_cpu: prepareGuaranteedUsageColumn('cpu'),
    guaranteed_usage_memory: prepareGuaranteedUsageColumn('user_memory'),
    guaranteed_usage_gpu: prepareGuaranteedUsageColumn('gpu'),
    guaranteed_usage_user_slots: prepareGuaranteedUsageColumn('user_slots'),

    operation_overview: {
        get(item: PoolInfo) {
            return [item.operationCount, item.runningOperationCount];
        },
        caption: 'Operations',
        sort: true,
        align: 'right',
    },
    operation_count: {
        get(item: PoolInfo) {
            return item.operationCount;
        },
        sort: true,
        align: 'right',
    },
    max_operation_count: {
        get(item: PoolInfo) {
            return item.maxOperationCount;
        },
        sort: true,
        align: 'right',
    },
    operation_progress: {
        get(item: PoolInfo) {
            return item.operationCount! / item.maxOperationCount!;
        },
        text(item: PoolInfo) {
            return `${format.Number(item.operationCount)} / ${format.Number(
                item.maxOperationCount,
            )}`;
        },
        caption: 'Total operations (usage/limit)',
        sort: true,
        align: 'center',
    },
    running_operation_count: {
        get(item: PoolInfo) {
            return item.runningOperationCount;
        },
        sort: true,
        align: 'right',
    },
    max_running_operation_count: {
        get(item: PoolInfo) {
            return item.maxRunningOperationCount;
        },
        sort: true,
        align: 'right',
    },
    running_operation_progress: {
        get(item: PoolInfo) {
            return item.runningOperationCount! / item.maxRunningOperationCount!;
        },
        text(item: PoolInfo) {
            return `${format.Number(item.runningOperationCount)} / ${format.Number(
                item.maxRunningOperationCount,
            )}`;
        },
        caption: 'Running operations (usage/limit)',
        sort: true,
        align: 'center',
    },

    integral_type: {
        get(item: PoolInfo) {
            const res = item.integralType;
            return res === 'none' ? undefined : res;
        },
        caption: 'Guarantee type',
        sort: true,
        align: 'right',
        sortWithUndefined: true,
    },
    burst_cpu: {
        get(item: PoolInfo) {
            return item.burstCPU;
        },
        sort(item: PoolInfo) {
            const res = item.burstCPU;
            return isNaN(res) ? undefined : res;
        },
        caption: 'Burst CPU',
        sortWithUndefined: true,
        align: 'right',
    },
    flow_cpu: {
        get(item: PoolInfo) {
            return item.flowCPU;
        },
        sort(item: PoolInfo) {
            const res = item.flowCPU;
            return isNaN(res) ? undefined : res;
        },
        caption: 'Flow CPU',
        sortWithUndefined: true,
        align: 'right',
    },
    children_burst_cpu: {
        get(item: PoolInfo) {
            const res = item.childrenBurstCPU;
            return !res ? undefined : res;
        },
        caption: "Children's burst CPU",
        sort: true,
        sortWithUndefined: true,
        align: 'right',
    },
    children_flow_cpu: {
        get(item: PoolInfo) {
            const res = item.childrenFlowCPU;
            return !res ? undefined : res;
        },
        caption: "Children's flow CPU",
        sort: true,
        sortWithUndefined: true,
        align: 'right',
    },
    accumulated: {
        get(item: PoolInfo) {
            return item.accumulated;
        },
        caption: 'Acc ratio volume',
        sortWithUndefined: true,
        sort: true,
        align: 'right',
    },
    accumulated_cpu: {
        get(item: PoolInfo) {
            return item.accumulatedCpu;
        },
        caption: 'Acc CPU volume',
        sort: true,
        align: 'right',
    },
    burst_duration: {
        get(item: PoolInfo) {
            return item.burstDuration;
        },
        caption: 'Est burst usage duration ',
        sort: true,
        sortWithUndefined: true,
        align: 'right',
    },

    actions: {
        caption: '',
        align: 'left',
    },
};
