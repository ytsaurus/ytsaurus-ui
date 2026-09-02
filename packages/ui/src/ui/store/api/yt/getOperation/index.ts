import {type OverrideDataType} from '../types';
import {useCurrentClusterArgs} from '../use-current-cluster';
import {ytApi} from '../ytApi';
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
    const queryArgs = useCurrentClusterArgs(args) as GetOperationApiArgs;
    const result = getOperationApi.useGetOperationQuery(queryArgs, options);

    return result as OverrideDataType<typeof result & {data?: unknown}, T>;
}
