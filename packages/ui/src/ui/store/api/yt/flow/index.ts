import {FlowExecuteCommand, FlowExecuteTypes} from '../../../../../shared/yt-types';
import {OverrideDataType} from '../types';
import {useCurrentClusterArgs} from '../use-current-cluster';
import {ytApi} from '../ytApi';
import {flowExecute} from './endpoint';

export const flowApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        flowExecute: build.query({
            queryFn: flowExecute,
            providesTags: (_result, _error, args) => {
                const {flow_command, pipeline_path} = args.parameters;
                return [`flowExecute_${flow_command}_${pipeline_path}`];
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
