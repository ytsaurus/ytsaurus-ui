import {
    OPERATION_POOL_RESOURCE_LIMIT_KEYS,
    type OperationPool,
} from '../../../../pages/operations/selectors';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

type ResourceLimitValue = number | string | undefined;

type ResourceLimitsInput = Record<
    string,
    Partial<Record<(typeof OPERATION_POOL_RESOURCE_LIMIT_KEYS)[number], ResourceLimitValue>>
>;

export type SchedulingOptionsUpdate = {
    pool?: string;
    weight?: number;
    resource_limits?: Partial<
        Record<(typeof OPERATION_POOL_RESOURCE_LIMIT_KEYS)[number], number | null>
    >;
};

export type SchedulingOptionsPerPoolTreeUpdate = Record<string, SchedulingOptionsUpdate>;

export function buildSchedulingOptionsUpdate(
    operationPools: OperationPool[],
    pools: Record<string, string>,
    weights: Record<string, number | undefined>,
    resourceLimits?: ResourceLimitsInput,
): SchedulingOptionsPerPoolTreeUpdate {
    const currentPools = Object.fromEntries(operationPools.map((item) => [item.tree, item]));
    const result: SchedulingOptionsPerPoolTreeUpdate = {};

    for (const [tree, pool] of Object.entries(pools)) {
        const current = currentPools[tree];
        const update: SchedulingOptionsUpdate = {};
        const newWeight = weights[tree];

        if (newWeight !== undefined && current?.weight !== Number(newWeight)) {
            update.weight = Number(newWeight);
        }
        if (current?.pool !== pool) {
            update.pool = pool;
        }

        if (resourceLimits?.[tree]) {
            let changed = false;
            const merged: SchedulingOptionsUpdate['resource_limits'] = {};

            for (const key of OPERATION_POOL_RESOURCE_LIMIT_KEYS) {
                const newValue = resourceLimits[tree][key];
                const oldValue = current?.resourceLimits?.[key];
                const isInvalidOrEmpty = newValue === '' || Number.isNaN(Number(newValue));

                if (newValue !== undefined && !isInvalidOrEmpty) {
                    merged[key] = Number(newValue);
                    changed ||= Number(newValue) !== oldValue;
                } else if (isInvalidOrEmpty && oldValue !== null && oldValue !== undefined) {
                    merged[key] = null;
                    changed = true;
                }
            }

            if (changed) {
                update.resource_limits = merged;
            }
        }

        if (Object.keys(update).length) {
            result[tree] = update;
        }
    }

    return result;
}

export function updateOperationAttributes(
    operationId: string,
    schedulingOptionsPerPoolTree: SchedulingOptionsPerPoolTreeUpdate,
): Promise<void> {
    return ytApiV3Id.updateOperationParameters(YTApiId.operationUpdateParameters, {
        parameters: {
            operation_id: operationId,
            _parameters: {
                scheduling_options_per_pool_tree: schedulingOptionsPerPoolTree,
            },
        },
    });
}
