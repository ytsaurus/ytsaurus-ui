import ypath from '../../common/thor/ypath';
import {
    type OperationPool,
    type OperationPoolResourceLimits,
    type OperationStates,
} from '../../pages/operations/selectors';
import {type CumulativeOperationSpecPatch, applyOperationSpecPatch} from './specification-patch';

type OperationSpecForEditing = {
    max_failed_job_count?: unknown;
    tasks?: Record<string, {job_count?: unknown}>;
};

type SchedulingOptions = {
    pool?: string;
    weight?: number;
    resource_limits?: OperationPoolResourceLimits;
};

export type OperationEditAttributes = {
    id: string;
    state: OperationStates;
    full_spec?: OperationSpecForEditing;
    cumulative_spec_patch?: CumulativeOperationSpecPatch;
    runtime_parameters?: {
        scheduling_options_per_pool_tree?: Record<string, SchedulingOptions>;
    };
};

export type EditOperationData = {
    id: string;
    state: OperationStates;
    pools: OperationPool[];
    resultingSpec?: OperationSpecForEditing;
};

function prepareResourceLimits(
    resourceLimits?: OperationPoolResourceLimits,
): OperationPoolResourceLimits | undefined {
    if (!resourceLimits) {
        return undefined;
    }

    const result: OperationPoolResourceLimits = {};

    for (const key of ['cpu', 'gpu', 'memory', 'user_slots'] as const) {
        const value = resourceLimits[key];
        if (typeof value === 'number') {
            result[key] = value;
        }
    }

    return Object.keys(result).length ? result : undefined;
}

function preparePools(attributes: OperationEditAttributes): OperationPool[] {
    const schedulingOptions = ypath.getValue(
        attributes,
        '/runtime_parameters/scheduling_options_per_pool_tree',
    ) as Record<string, SchedulingOptions> | undefined;

    return Object.entries(schedulingOptions ?? {}).map(([tree, options]) => ({
        tree,
        pool: options.pool ?? '',
        isEphemeral: false,
        weight: options.weight ?? 1,
        resourceLimits: prepareResourceLimits(options.resource_limits),
    }));
}

export function prepareEditOperationData(attributes: OperationEditAttributes): EditOperationData {
    const fullSpec = ypath.getValue(attributes, '/full_spec') as
        OperationSpecForEditing | undefined;
    const cumulativeSpecPatch = ypath.getValue(attributes, '/cumulative_spec_patch') as
        CumulativeOperationSpecPatch | undefined;

    return {
        id: ypath.getValue(attributes, '/id'),
        state: ypath.getValue(attributes, '/state'),
        pools: preparePools(attributes),
        resultingSpec: applyOperationSpecPatch(fullSpec, cumulativeSpecPatch),
    };
}
