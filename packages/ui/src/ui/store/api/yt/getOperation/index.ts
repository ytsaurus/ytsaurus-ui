import {type OverrideDataType} from '../types';
import {getEffectiveClusterArgs, useEffectiveClusterArgs} from '../utils';
import {ytApi} from '../ytApi';
import {useSelector} from '../../../redux-hooks';
import {selectCluster} from '../../../selectors/global/cluster';
import {type GetOperationApiArgs, getOperation} from './endpoint';

export const getOperationApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        getOperation: build.query({
            queryFn: getOperation,
        }),
    }),
});

export function useGetOperationQuery<T>(
    args: GetOperationApiArgs,
    options?: Parameters<typeof getOperationApi.useGetOperationQuery>[1],
) {
    const queryArgs = useEffectiveClusterArgs(args) as GetOperationApiArgs;
    const result = getOperationApi.useGetOperationQuery(queryArgs, options);

    return result as OverrideDataType<typeof result & {data?: unknown}, T>;
}

export function useLazyGetOperationQuery<T>() {
    const currentCluster = useSelector(selectCluster);
    const [trigger, result, lastPromiseInfo] = getOperationApi.useLazyGetOperationQuery();

    const triggerForCurrentCluster = (args: GetOperationApiArgs, preferCacheValue?: boolean) =>
        trigger(getEffectiveClusterArgs(args, currentCluster), preferCacheValue);

    return [
        triggerForCurrentCluster,
        result as OverrideDataType<typeof result & {data?: unknown}, T>,
        lastPromiseInfo,
    ] as const;
}
