import moment from 'moment';

import format from '../../common/hammer/format';
import type {PoolResourceType} from '../../store/selectors/scheduling/scheduling-pools';
import {SchedulingRowData} from './pool-child';

function prepareDetailedColumn(resource: PoolResourceType) {
    return {
        get(item: SchedulingRowData) {
            return item.resources?.[resource]?.detailed;
        },
        sort: true,
        caption: 'Abs fair share' + ReadableResource(resource),
        align: 'right',
    };
}

function prepareLimitColumn(resource: PoolResourceType) {
    return {
        get(item: SchedulingRowData) {
            return item.resources?.[resource]?.limit;
        },
        sort: true,
        sortWithUndefined: true,
        caption: 'Limit' + ReadableResource(resource),
        align: 'right',
    };
}

function prepareMinResourcesColumn(resource: PoolResourceType) {
    return {
        get(item: SchedulingRowData) {
            return item.resources?.[resource]?.min;
        },
        sort: true,
        caption: 'Strong guar.' + ReadableResource(resource),
        title: 'Strong guarantee',
        align: 'right',
    };
}

function prepareAbsGuaranteedColumn(
    resource: PoolResourceType,
    guaranteeType: 'guaranteed' | 'effectiveGuaranteed',
) {
    return {
        get(item: SchedulingRowData) {
            return item.resources?.[resource]?.[guaranteeType];
        },
        sort: true,
        caption: 'Estimated guar.' + ReadableResource(resource),
        title: 'Estimated guarantee',
        align: 'right',
    };
}

function ReadableResource(resource: PoolResourceType) {
    switch (resource) {
        case 'user_memory':
            return ' RAM';
        case 'user_slots':
            return ' Slots';
        default:
            return ' ' + format.ReadableField(resource);
    }
}

function prepareAbsDemandColumn(resource: PoolResourceType) {
    return {
        get(item: SchedulingRowData) {
            return item.resources?.[resource]?.demand;
        },
        sort: true,
        caption: 'Abs demand' + ReadableResource(resource),
        align: 'right',
    };
}

function prepareAbsUsageColumn(resource: PoolResourceType) {
    return {
        get(item: SchedulingRowData) {
            return item.resources?.[resource]?.usage;
        },
        sort: true,
        caption: 'Abs usage' + ReadableResource(resource),
        align: 'right',
    };
}

export const childTableItems = {
    name: {
        sort(item: SchedulingRowData) {
            if (item.type === 'operation') {
                if (item.fifoIndex !== undefined) {
                    return '#0_' + String(item.fifoIndex).padStart(6, '0');
                }
                return item.name ? '#1_' + item.name : '#2_' + item.id;
            }
            return item.name;
        },
        caption: 'Pool / Operation',
        align: 'left',
    },
    type: {
        sort(item: SchedulingRowData) {
            const {type, integralType, operationType} = item;
            return type === 'pool' ? integralType : operationType;
        },
        caption: 'Type',
    },
    user: {
        sort(item: SchedulingRowData) {
            return item.user;
        },
    },
    owner: {
        sort(item: SchedulingRowData) {
            const {type, abc, user} = item;
            return type === 'pool' ? abc?.slug : user;
        },
    },
    mode: {
        sort(item: SchedulingRowData) {
            return item.mode;
        },
        align: 'center',
    },
    view_mode: {
        sort(item: SchedulingRowData) {
            const {type, mode, operationType} = item;
            return type === 'pool' ? mode : operationType;
        },
    },
    guaranteed: {
        sort(_item: SchedulingRowData) {
            return undefined;
        },
    },
    FI: {
        sort(item: SchedulingRowData) {
            return item.fifoIndex;
        },
        align: 'center',
    },
    weight: {
        sort(item: SchedulingRowData) {
            return item.weight;
        },
        align: 'right',
    },
    min_share: {
        sort(item: SchedulingRowData) {
            return item.minShareRatio;
        },
        align: 'right',
    },
    max_share: {
        sort(item: SchedulingRowData) {
            return item.maxShareRatio;
        },
        align: 'right',
    },
    fair_share: {
        get(item: SchedulingRowData) {
            return item.fairShareRatio;
        },
        sort: true,
        align: 'right',
    },
    usage: {
        sort(item: SchedulingRowData) {
            return item.usageRatio;
        },
        align: 'right',
    },
    demand: {
        sort(item: SchedulingRowData) {
            return item.demandRatio;
        },
        align: 'right',
    },
    fair_share_usage: {
        sort(item: SchedulingRowData) {
            const {fairShareRatio, usageRatio} = item;
            try {
                const res = usageRatio! / fairShareRatio!;
                return isNaN(res) ? undefined : res;
            } catch {
                return format.NO_VALUE;
            }
        },
        caption: 'Usage / Fair share',
        align: 'left',
    },
    dominant_resource: {
        sort(item: SchedulingRowData) {
            const {dominantResource, fairShareRatio, usageRatio} = item;
            if (!fairShareRatio && !usageRatio) {
                return format.NO_VALUE;
            }

            return dominantResource;
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

    abs_guaranteed_cpu: prepareAbsGuaranteedColumn('cpu', 'guaranteed'),
    abs_guaranteed_memory: prepareAbsGuaranteedColumn('user_memory', 'guaranteed'),
    abs_guaranteed_gpu: prepareAbsGuaranteedColumn('gpu', 'guaranteed'),
    abs_guaranteed_user_slots: prepareAbsGuaranteedColumn('user_slots', 'guaranteed'),

    abs_effective_guaranteed_cpu: prepareAbsGuaranteedColumn('cpu', 'effectiveGuaranteed'),
    abs_effective_guaranteed_memory: prepareAbsGuaranteedColumn(
        'user_memory',
        'effectiveGuaranteed',
    ),
    abs_effective_guaranteed_gpu: prepareAbsGuaranteedColumn('gpu', 'effectiveGuaranteed'),
    abs_effective_guaranteed_user_slots: prepareAbsGuaranteedColumn(
        'user_slots',
        'effectiveGuaranteed',
    ),

    abs_usage_cpu: prepareAbsUsageColumn('cpu'),
    abs_usage_memory: prepareAbsUsageColumn('user_memory'),
    abs_usage_gpu: prepareAbsUsageColumn('gpu'),
    abs_usage_user_slots: prepareAbsUsageColumn('user_slots'),

    abs_demand_cpu: prepareAbsDemandColumn('cpu'),
    abs_demand_memory: prepareAbsDemandColumn('user_memory'),
    abs_demand_gpu: prepareAbsDemandColumn('gpu'),
    abs_demand_user_slots: prepareAbsDemandColumn('user_slots'),

    operation_overview: {
        get(item: SchedulingRowData) {
            return [item.operationCount, item.runningOperationCount];
        },
        caption: 'Operations',
        sort: true,
        align: 'right',
    },
    operation_count: {
        get(item: SchedulingRowData) {
            return item.operationCount;
        },
        sort: true,
        align: 'right',
    },
    max_operation_count: {
        get(item: SchedulingRowData) {
            return item.maxOperationCount;
        },
        sort: true,
        align: 'right',
    },
    operation_progress: {
        get(item: SchedulingRowData) {
            return item.operationCount! / item.maxOperationCount!;
        },
        text(item: SchedulingRowData) {
            return `${format.Number(item.operationCount)} / ${format.Number(
                item.maxOperationCount,
            )}`;
        },
        caption: 'Total operations (usage/limit)',
        sort: true,
        align: 'center',
    },
    running_operation_count: {
        get(item: SchedulingRowData) {
            return item.runningOperationCount;
        },
        sort: true,
        align: 'right',
    },
    max_running_operation_count: {
        get(item: SchedulingRowData) {
            return item.maxRunningOperationCount;
        },
        sort: true,
        align: 'right',
    },
    running_operation_progress: {
        get(item: SchedulingRowData) {
            return item.runningOperationCount! / item.maxRunningOperationCount!;
        },
        text(item: SchedulingRowData) {
            return `${format.Number(item.runningOperationCount)} / ${format.Number(
                item.maxRunningOperationCount,
            )}`;
        },
        caption: 'Running operations (usage/limit)',
        sort: true,
        align: 'center',
    },

    integral_type: {
        get(item: SchedulingRowData) {
            const res = item.integralType;
            return res === 'none' ? undefined : res;
        },
        caption: 'Guarantee type',
        sort: true,
        align: 'right',
        sortWithUndefined: true,
    },
    burst_cpu: {
        get(item: SchedulingRowData) {
            return item.burstCPU;
        },
        sort(item: SchedulingRowData) {
            const res = item.burstCPU;
            return isNaN(res!) ? undefined : res;
        },
        caption: 'Burst CPU',
        sortWithUndefined: true,
        align: 'right',
    },
    flow_cpu: {
        get(item: SchedulingRowData) {
            return item.flowCPU;
        },
        sort(item: SchedulingRowData) {
            const res = item.flowCPU;
            return isNaN(res!) ? undefined : res;
        },
        caption: 'Flow CPU',
        sortWithUndefined: true,
        align: 'right',
    },
    children_burst_cpu: {
        get(item: SchedulingRowData) {
            const res = item.childrenBurstCPU;
            return !res ? undefined : res;
        },
        caption: "Children's burst CPU",
        sort: true,
        sortWithUndefined: true,
        align: 'right',
    },
    children_flow_cpu: {
        get(item: SchedulingRowData) {
            const res = item.childrenFlowCPU;
            return !res ? undefined : res;
        },
        caption: "Children's flow CPU",
        sort: true,
        sortWithUndefined: true,
        align: 'right',
    },
    accumulated: {
        get(item: SchedulingRowData) {
            return item.accumulated;
        },
        caption: 'Acc ratio volume',
        sortWithUndefined: true,
        sort: true,
        align: 'right',
    },
    accumulated_cpu: {
        get(item: SchedulingRowData) {
            return item.accumulatedCpu;
        },
        caption: 'Acc CPU volume',
        sort: true,
        align: 'right',
    },
    burst_duration: {
        get(item: SchedulingRowData) {
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
        sort(_item: SchedulingRowData) {
            return undefined;
        },
    },

    duration: {
        sort(item: SchedulingRowData) {
            if (!item.startTime) {
                return undefined;
            }
            const startTime = moment(item.startTime).valueOf();
            return Date.now() - startTime;
        },
    },
} as const;

export type SchedulingColumn = keyof typeof childTableItems;

export function isSchedulingColumnName(column: string): column is SchedulingColumn {
    return childTableItems[column as unknown as SchedulingColumn] !== undefined;
}
