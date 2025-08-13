import {useSelector} from 'react-redux';
import {BaseQueryFn, TypedUseMutationResult} from '@reduxjs/toolkit/dist/query/react';

import {rootApi} from '..';
import {BatchApiArgs, BatchApiResults, executeBatchV3} from './endpoints/executeBatch';
import {getUseAutoRefresh} from '../../../store/selectors/settings/settings-ts';
import {getCluster} from '../../../store/selectors/global';

import {DEFAULT_UPDATER_TIMEOUT} from '../../../hooks/use-updater';
import {YTApiId} from '../../../../shared/constants/yt-api-id';

import {MutationOptions, UseQueryOptions} from './types';
import {listQueries} from './endpoints/listQueries';
import {flowExecute} from './endpoints/flowExecute';
import {FlowExecuteCommand, FlowExecuteData} from '../../../../shared/yt-types';
import {OverrideDataType} from './endpoints/types';

export const ytApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        fetchBatch: build.query<BatchApiResults, BatchApiArgs>({
            queryFn: executeBatchV3,
            providesTags: (_result, _error, arg) => [arg.id],
        }),
        updateBatch: build.mutation<BatchApiResults, BatchApiArgs>({
            queryFn: executeBatchV3,
            invalidatesTags: (_result, _error, arg) => [arg.id],
        }),
        listQueries: build.query({
            queryFn: listQueries,
            providesTags: (_result, _error, _arg) => [YTApiId.listQueries],
        }),
        flowExecute: build.query({
            queryFn: flowExecute,
            providesTags: (_result, _error, _args) => {
                const {flow_command, pipeline_path} = _args.parameters;
                return [`flowExecuteDescribePipeline_${flow_command}_${pipeline_path}`];
            },
        }),
    }),
});

export const {useListQueriesQuery} = ytApi;

export function useFlowExecuteQuery<T extends FlowExecuteCommand>(
    ...args: Parameters<typeof flowExecute>
) {
    const res = ytApi.useFlowExecuteQuery(...args);
    return res as OverrideDataType<typeof res, FlowExecuteData[T]>;
}

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
    args: BatchQueryArgs,
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

    const customArgs =
        'setup' in args && 'proxy' in args.setup
            ? args
            : {
                  ...args,
                  cluster,
              };

    const res = ytApi.useFetchBatchQuery(customArgs, customOptions);
    return res as OverrideDataType<typeof res, BatchApiResults<T>>;
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
    const [updateFn, result] = ytApi.useUpdateBatchMutation(options);
    // cluster param makes no sense for mutation requests
    const typedUpdateFn = async (args: Omit<BatchApiArgs, 'cluster'>) => {
        // adding cluster param for types compatibility
        const response = await updateFn({...args, cluster: ''});
        if (response.data) {
            return {
                data: response.data as BatchApiResults<T> | undefined,
            };
        }

        return response;
    };

    return [typedUpdateFn, result] as const;
}
