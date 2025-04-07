import {useSelector} from 'react-redux';
import {BaseQueryFn, TypedUseMutationResult} from '@reduxjs/toolkit/dist/query/react';

import {rootApi} from '..';
import {BatchApiArgs, BatchApiResults, executeBatchV3} from './endpoints/executeBatch';
import {getUseAutoRefresh} from '../../../store/selectors/settings/settings-ts';
import {getCluster} from '../../../store/selectors/global';
import {DEFAULT_UPDATER_TIMEOUT} from '../../../hooks/use-updater';
import {MutationOptions, UseQueryOptions} from './types';

export const ytApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        fetchBatch: build.query<BatchApiResults, BatchApiArgs>({
            queryFn: executeBatchV3,
            providesTags: (_result, _error, arg) => [String(arg.id)],
        }),
        updateBatch: build.mutation<BatchApiResults, BatchApiArgs>({
            queryFn: executeBatchV3,
            invalidatesTags: (_result, _error, arg) => [String(arg.id)],
        }),
    }),
});

const {
    useFetchBatchQuery: useFetchBatchQueryRaw,
    useUpdateBatchMutation: useUpdateBatchMutationRaw,
} = ytApi;

type BatchQueryResult = typeof ytApi.endpoints.fetchBatch.Types.ResultType;
type BatchQueryArgs = typeof ytApi.endpoints.fetchBatch.Types.QueryArg;

/**
 * Custom hook for fetching batch query data with automatic type conversion.
 * This hook extends the base RTK Query functionality with automatic refresh support
 *
 * @template T The expected type of the batch results data
 * @param args The batch API arguments including YTApiId, cluster dependency and parameters for the batch operation
 * @param options Optional query configuration options (polling, caching, etc.)
 * @returns A query result object with properly typed data and status information
 *
 * @example
 * const { data, isLoading } = useFetchBatchQuery<MyDataType>({
 *   id: YTApiId.getMyAttribute,
 *   parameters: {
 *       requests: [
 *            {
 *               command: 'get' as const,
 *               parameters: prepareRequest('/@my_attribute', {
 *                  path,
 *               }),
 *           },
 *       ],
 *   },
 * });
 */
export function useFetchBatchQuery<T>(
    args: BatchQueryArgs extends {setup: unknown}
        ? BatchQueryArgs
        : Omit<BatchQueryArgs, 'cluster'>,
    options?: UseQueryOptions<BatchQueryResult, BatchQueryArgs>,
) {
    const useAutoRefresh = useSelector(getUseAutoRefresh);
    const cluster = useSelector(getCluster);

    const defaultOptions = {
        pollingInterval: useAutoRefresh ? DEFAULT_UPDATER_TIMEOUT : undefined,
        skipPollingIfUnfocused: true,
    };

    const customOptions = {
        ...defaultOptions,
        ...options,
    };

<<<<<<< HEAD
    const customArgs =
        'setup' in args
            ? args
            : {
                  ...args,
                  cluster,
              };
=======
    const customArgs: BatchApiArgs = {
        ...args,
    };
>>>>>>> 3acc6183 (chore: setup rtk query and execute batch endpoint)

    if (!args.setup) {
        customArgs.cluster = cluster;
    }

    const {data, ...restResult} = useFetchBatchQueryRaw(customArgs, customOptions);

    const typedData = data as BatchApiResults<T> | undefined;

    return {
        ...restResult,
        data: typedData,
    };
}

type BatchMutationDefinition = typeof ytApi.endpoints.updateBatch.Types.MutationDefinition;
type BatchMutationResultType = typeof ytApi.endpoints.updateBatch.Types.ResultType;

type BatchMutationReturnType = TypedUseMutationResult<
    BatchMutationResultType,
    BatchApiArgs,
    BaseQueryFn
>;

/**
 * Custom hook for executing batch mutation operations.
 *
 * @template T The expected type of the batch results data
 * @param options Optional mutation configuration options
 * @returns A tuple containing:
 *   - A typed mutation function that accepts BatchApiArgs
 *   - The mutation result object with status and data
 *
 * @example
 * const [updateBatch, { isLoading }] = useUpdateBatchMutation<MyDataType>();
 *
 * // Later in code:
 * const result = await updateBatch({
 *       id: YTApiId.navigationGetAnnotation,
 *       parameters: {
 *           requests: [
 *               {
 *                   command: 'set' as const,
 *                   parameters: prepareRequest('/@annotation', {
 *                       path,
 *                   }),
 *                  input: annotation,
 *              },
 *          ],
 *      },
 *      toaster: {
 *          toasterName: 'update_annotation',
 *          successTitle: 'Annotation saved',
 *          errorTitle: 'Failed to save annotation',
 *      },
 * });
 */
export function useUpdateBatchMutation<T>(
    options?: MutationOptions<BatchMutationReturnType, BatchMutationDefinition>,
) {
    const [updateFn, result] = useUpdateBatchMutationRaw(options);
    const typedUpdateFn = async (args: BatchApiArgs) => {
        const response = await updateFn(args);
        if (response.data) {
            return {
                data: response.data as BatchApiResults<T> | undefined,
            };
        }

        return response;
    };

    return [typedUpdateFn, result] as const;
}
