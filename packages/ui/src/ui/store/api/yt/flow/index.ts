import {type SkipToken, skipToken} from '@reduxjs/toolkit/query';

import {
    type FlowDeleteStatesBody,
    type FlowDeleteStatesResponse,
    type FlowExecuteCommand,
    type FlowExecuteTypes,
    type FlowReadStatesBody,
    type FlowReadStatesResponse,
    type FlowStaticSpec,
    type GetPipelineStateData,
} from '../../../../../shared/yt-types';
import {TYPED_INPUT_FORMAT, TYPED_OUTPUT_FORMAT} from '../../../../constants';
import {ytApiV4} from '../../../../rum/rum-wrap-api';
import {useSelector} from '../../../../store/redux-hooks';
import {selectCluster} from '../../../../store/selectors/global/cluster';
import {type YTError} from '../../../../types';
import {type OverrideDataType, type YTEndpointApiArgs} from '../types';
import {useCurrentClusterArgs} from '../use-current-cluster';
import {ytApi} from '../ytApi';
import {flowExecute} from './endpoint';
import {normalizeReadStatesResponse} from './read-states-normalize';

export type FlowPipelineArgs = YTEndpointApiArgs<{pipeline_path: string}>;
export type FlowReadStatesArgs = FlowPipelineArgs & {body: FlowReadStatesBody};
export type FlowDeleteStatesArgs = {
    parameters: {pipeline_path: string};
    body: FlowDeleteStatesBody;
};

export const flowApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        flowExecute: build.query({
            queryFn: flowExecute,
            providesTags: (_result, _error, args) => {
                const {flow_command, pipeline_path} = args.parameters;
                return [`flowExecute_${flow_command}_${pipeline_path}`];
            },
        }),
        flowReadStates: build.query<FlowReadStatesResponse, FlowReadStatesArgs>({
            queryFn: async (args) => {
                const res = await flowExecute<'read-states'>({
                    ...args,
                    parameters: {
                        ...args.parameters,
                        flow_command: 'read-states',
                        input_format: TYPED_INPUT_FORMAT,
                        output_format: TYPED_OUTPUT_FORMAT,
                    },
                });
                return 'error' in res ? res : {data: normalizeReadStatesResponse(res.data)};
            },
        }),
        flowDeleteStates: build.mutation<FlowDeleteStatesResponse, FlowDeleteStatesArgs>({
            queryFn: (args) => {
                return flowExecute<'delete-states'>({
                    ...args,
                    parameters: {
                        ...args.parameters,
                        flow_command: 'delete-states',
                        input_format: TYPED_INPUT_FORMAT,
                    },
                });
            },
        }),
        flowStaticSpec: build.query<FlowStaticSpec | undefined, FlowPipelineArgs>({
            queryFn: async ({parameters}) => {
                try {
                    const res = await ytApiV4.getPipelineSpec({parameters});
                    return {data: res?.spec};
                } catch (error) {
                    return {error} as {error: YTError};
                }
            },
        }),
        flowPipelineState: build.query<GetPipelineStateData, FlowPipelineArgs>({
            queryFn: async ({parameters}) => {
                try {
                    return {data: await ytApiV4.getPipelineState({parameters})};
                } catch (error) {
                    return {error} as {error: YTError};
                }
            },
        }),
    }),
});

export function useFlowExecuteQuery<T extends FlowExecuteCommand>(
    ...args: Parameters<typeof flowExecute<T>>
) {
    const [first, ...rest] = args;
    const res = flowApi.useFlowExecuteQuery(useCurrentClusterArgs(first), ...rest);
    return res as OverrideDataType<typeof res, FlowExecuteTypes[T]['ResponseType']>;
}

export function useFlowReadStatesQuery(args: FlowReadStatesArgs | SkipToken) {
    const cluster = useSelector(selectCluster);
    const queryArgs = args === skipToken || 'setup' in args ? args : {cluster, ...args};
    return flowApi.useFlowReadStatesQuery(queryArgs);
}

export function useFlowStaticSpecQuery(args: FlowPipelineArgs) {
    return flowApi.useFlowStaticSpecQuery(useCurrentClusterArgs(args));
}

export function useFlowPipelineStateQuery(
    args: FlowPipelineArgs,
    options?: {skip?: boolean; refetchOnMountOrArgChange?: boolean},
) {
    return flowApi.useFlowPipelineStateQuery(useCurrentClusterArgs(args), options);
}

export const useFlowDeleteStatesMutation = flowApi.useFlowDeleteStatesMutation;
