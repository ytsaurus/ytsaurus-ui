import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {YTError} from '../../../../types';
import {YTEndpointApiArgs} from '../types';
import {
    FlowExecuteCommand,
    FlowExecuteCommandBody,
    FlowExecuteData,
    FlowExecuteParams,
} from '../../../../../shared/yt-types';

export type FlowApiArgs<T extends FlowExecuteCommand> = YTEndpointApiArgs<FlowExecuteParams<T>> &
    FlowExecuteCommandBody<T>;

export async function flowExecute<T extends FlowExecuteCommand>({...args}: FlowApiArgs<T>) {
    try {
        const data = (await ytApiV4Id.flowExecute(YTApiId.flowExecuteDescribePipeline, {
            ...args,
            data: args.body ?? {},
        })) as FlowExecuteData[T];

        return {data};
    } catch (error: unknown) {
        return {error} as {error: YTError};
    }
}
