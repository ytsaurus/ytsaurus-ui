import {FlowExecuteCommand, FlowExecuteData} from '../../../../../shared/yt-types';

import {ytApi} from '../baseYTApi';
import {OverrideDataType} from '../types';
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
    ...args: Parameters<typeof flowExecute>
) {
    const res = flowApi.useFlowExecuteQuery(...args);
    return res as OverrideDataType<typeof res, FlowExecuteData[T]>;
}
