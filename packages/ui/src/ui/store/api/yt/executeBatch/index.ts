import {useSelector} from '../../../../store/redux-hooks';
import {BaseQueryFn, TypedUseMutationResult} from '@reduxjs/toolkit/query/react';

import {getUseAutoRefresh} from '../../../../store/selectors/settings/settings-ts';
import {getCluster} from '../../../../store/selectors/global';

import {DEFAULT_UPDATER_TIMEOUT} from '../../../../hooks/use-updater';

import {ytApi} from '../ytApi';
import type {MutationOptions, OverrideDataType, UseQueryOptions} from '../types';

import {executeBatchV3} from './endpoint';
import type {BatchApiArgs, BatchApiResults} from './endpoint';

const updateExecuteBatch: typeof executeBatchV3 = async (...args) => {
    const res = await executeBatchV3(...args);
    if ('error' in res) {
        throw res.error;
    }
    return res;
};

export const batchApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        fetchBatch: build.query<BatchApiResults, BatchApiArgs>({
            queryFn: executeBatchV3,
            providesTags: (_result, _error, arg) => [arg.id],
        }),
        updateBatch: build.mutation<BatchApiResults, BatchApiArgs>({
            queryFn: updateExecuteBatch,
            invalidatesTags: (_result, _error, arg) => [arg.id],
        }),
    }),
});

type BatchQueryResult = typeof batchApi.endpoints.fetchBatch.Types.ResultType;

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
    args: BatchApiArgs,
    options?: UseQueryOptions<BatchQueryResult, BatchApiArgs>,
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

    const customArgs =
        'setup' in args
            ? args
            : {
                  ...args,
                  cluster,
              };

    const res = batchApi.useFetchBatchQuery(customArgs, customOptions);
    return res as OverrideDataType<typeof res, BatchApiResults<T>>;
}

type BatchMutationDefinition = typeof batchApi.endpoints.updateBatch.Types.MutationDefinition;
type BatchMutationResultType = typeof batchApi.endpoints.updateBatch.Types.ResultType;

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
    const [updateFn, result] = batchApi.useUpdateBatchMutation(options);
    // cluster param makes no sense for mutation requests
    const typedUpdateFn = async (args: Omit<BatchApiArgs, 'cluster'>) => {
        // adding cluster param for types compatibility
        const response = await updateFn({...args, cluster: ''});
        if (response.data) {
            return {
                data: response.data as BatchApiResults<T> | undefined,
            };
        }

        if (response.error) {
            throw response.error;
        }

        return response;
    };

    return [typedUpdateFn, result] as const;
}

export {BatchApiResults};
