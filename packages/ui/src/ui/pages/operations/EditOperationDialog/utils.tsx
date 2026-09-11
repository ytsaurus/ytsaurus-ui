import {type OperationPool, type OperationPoolResourceLimits} from '../selectors';
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

type SetPoolsAndWeightsOptions = {closeOnSuccess?: boolean};

type SetPoolsAndWeightsFn = (
    operation: {pools?: OperationPool[]},
    poolsMap: Record<string, string>,
    weightsMap: Record<string, number | undefined>,
    resourceLimitsMap: Record<string, OperationPoolResourceLimits>,
    options?: SetPoolsAndWeightsOptions,
) => (dispatch: unknown) => Promise<unknown>;

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

export async function submitTrees(
    values: FormValues,
    operation: {pools?: OperationPool[]},
    dispatch: (action: unknown) => Promise<unknown>,
    setPoolsAndWeights: SetPoolsAndWeightsFn,
) {
    const {poolsMap, weightsMap, resourceLimitsMap} = collectMapsForTrees(values);

    await dispatch(
        setPoolsAndWeights(operation, poolsMap, weightsMap, resourceLimitsMap, {
            closeOnSuccess: true,
        }),
    );
}

export async function submitTreesWithToaster(
    values: FormValues,
    operation: {pools?: OperationPool[]; $value?: string},
    dispatch: (action: unknown) => Promise<unknown>,
    setPoolsAndWeights: SetPoolsAndWeightsFn,
) {
    await wrapApiPromiseByToaster(
        submitTrees(values, operation, dispatch, setPoolsAndWeights) as Promise<unknown>,
        {
            toasterName: 'pools-weights-edit-all',
            successTitle: i18n('alert_save-success', {operation: operation.$value}),
            errorTitle: i18n('alert_save-failure', {operation: operation.$value}),
        },
    );
}
