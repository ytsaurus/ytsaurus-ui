import {type OperationPool, type OperationPoolResourceLimits} from '../selectors';
import {
    type SchedulingOptionsPerPoolTreeUpdate,
    buildSchedulingOptionsUpdate,
} from '../../../store/actions/operations/helpers/updateOperationAttributes';
import i18n from './i18n';
import {wrapApiPromiseByToaster} from '../../../utils/utils';

type NumberFieldValue = {value?: number; error?: string};

export type PoolData = {
    pool: string;
    tree: string;
    weight: NumberFieldValue;
    cpu: NumberFieldValue;
    gpu: NumberFieldValue;
    memory: number | undefined;
    user_slots: NumberFieldValue;
};

export type FormValues = Record<string, PoolData>;

export function buildInitialValues(pools: OperationPool[]): FormValues {
    const formValues: FormValues = {};

    for (const item of pools) {
        const {cpu, gpu, memory, user_slots} = item.resourceLimits || {};

        formValues[item.tree] = {
            pool: item.pool,
            tree: item.tree,
            weight: {value: item.weight ?? 1},
            cpu: {value: cpu},
            gpu: {value: gpu},
            memory,
            user_slots: {value: user_slots},
        };
    }

    return formValues;
}

function collectMapsForTrees(values: FormValues, treesFilter?: Set<string>) {
    const poolsMap: Record<string, string> = {};
    const weightsMap: Record<string, number | undefined> = {};
    const resourceLimitsMap: Record<string, OperationPoolResourceLimits> = {};

    for (const [tree, poolData] of Object.entries(values)) {
        if (treesFilter && !treesFilter.has(tree)) {
            continue;
        }

        if (!poolData || typeof poolData !== 'object') {
            continue;
        }

        if (!poolData.pool || !poolData.tree) {
            continue;
        }

        poolsMap[tree] = poolData.pool;
        weightsMap[tree] = poolData.weight?.value;

        const resourceLimits: OperationPoolResourceLimits = {};

        resourceLimits.cpu = poolData.cpu?.value;
        resourceLimits.gpu = poolData.gpu?.value;
        resourceLimits.memory = poolData.memory;
        resourceLimits.user_slots = poolData.user_slots?.value;

        resourceLimitsMap[tree] = resourceLimits;
    }

    return {poolsMap, weightsMap, resourceLimitsMap};
}

export function getSchedulingOptionsUpdate(
    values: FormValues,
    operation: {id: string; pools: OperationPool[]},
): SchedulingOptionsPerPoolTreeUpdate {
    const {poolsMap, weightsMap, resourceLimitsMap} = collectMapsForTrees(values);
    return buildSchedulingOptionsUpdate(operation.pools, poolsMap, weightsMap, resourceLimitsMap);
}

type SetPoolsAndWeightsOptions = {closeOnSuccess?: boolean};

type SetPoolsAndWeightsFn = (
    operation: {pools?: OperationPool[]},
    poolsMap: Record<string, string>,
    weightsMap: Record<string, number | undefined>,
    resourceLimitsMap: Record<string, OperationPoolResourceLimits>,
    options?: SetPoolsAndWeightsOptions,
) => (dispatch: unknown) => Promise<unknown>;

export async function submitTreesWithToaster(
    values: FormValues,
    operation: {pools?: OperationPool[]; $value?: string},
    dispatch: (action: unknown) => Promise<unknown>,
    setPoolsAndWeights: SetPoolsAndWeightsFn,
) {
    const {poolsMap, weightsMap, resourceLimitsMap} = collectMapsForTrees(values);

    await wrapApiPromiseByToaster(
        dispatch(
            setPoolsAndWeights(operation, poolsMap, weightsMap, resourceLimitsMap, {
                closeOnSuccess: true,
            }),
        ),
        {
            toasterName: 'pools-weights-edit-all',
            successTitle: i18n('alert_save-success', {operation: operation.$value}),
            errorTitle: i18n('alert_save-failure', {operation: operation.$value}),
        },
    );
}
