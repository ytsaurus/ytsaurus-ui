import {type OperationPool, type OperationPoolResourceLimits} from '../selectors';
import i18n from './i18n';
import {wrapApiPromiseByToaster} from '../../../utils/utils';

type NumberFieldValue = {value?: number; error?: string};

export type PoolData = {
    pool: string;
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

function collectMapsForTrees(
    values: FormValues,
    operation: {pools?: OperationPool[]},
    treesFilter?: Set<string>,
) {
    const poolsMap: Record<string, string> = {};
    const weightsMap: Record<string, number | undefined> = {};
    const resourceLimitsMap: Record<string, OperationPoolResourceLimits> = {};

    for (const item of operation.pools ?? []) {
        if (treesFilter && !treesFilter.has(item.tree)) {
            continue;
        }
        const poolData = values[item.tree];
        poolsMap[item.tree] = poolData?.pool ?? '';
        weightsMap[item.tree] = poolData?.weight?.value;

        resourceLimitsMap[item.tree] = {
            cpu: poolData?.cpu?.value,
            gpu: poolData?.gpu?.value,
            memory: poolData?.memory,
            user_slots: poolData?.user_slots?.value,
        };
    }

    return {poolsMap, weightsMap, resourceLimitsMap};
}

export async function submitTree(
    tree: string,
    values: FormValues,
    operation: {pools?: OperationPool[]},
    dispatch: (action: unknown) => Promise<unknown>,
    setPoolsAndWeights: SetPoolsAndWeightsFn,
) {
    const {poolsMap, weightsMap, resourceLimitsMap} = collectMapsForTrees(
        values,
        operation,
        new Set([tree]),
    );

    await dispatch(
        setPoolsAndWeights(operation, poolsMap, weightsMap, resourceLimitsMap, {
            closeOnSuccess: false,
        }),
    );
}

export async function submitTreeWithToaster(
    tree: string,
    values: FormValues,
    operation: {pools?: OperationPool[]; $value?: string},
    dispatch: (action: unknown) => Promise<unknown>,
    setPoolsAndWeights: SetPoolsAndWeightsFn,
    onErrorChange: (err: unknown) => void,
) {
    try {
        await wrapApiPromiseByToaster(
            submitTree(tree, values, operation, dispatch, setPoolsAndWeights) as Promise<any>,
            {
                toasterName: `pools-weights-edit-${tree}`,
                successTitle: i18n('alert_save-success', {tree}),
                errorTitle: i18n('alert_save-failure', {tree}),
            },
        );
    } catch (error) {
        onErrorChange(error);
        throw error;
    }
}
