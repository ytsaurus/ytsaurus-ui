import {FlowExecuteCommand, FlowExecuteTypes} from '../../../../../shared/yt-types';
import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {YTError} from '../../../../types';
import {YTEndpointApiArgs} from '../types';

export type FlowApiArgs<T extends FlowExecuteCommand> = YTEndpointApiArgs<
    FlowExecuteTypes[T]['ParamsType']
> &
    FlowExecuteTypes[T]['BodyType'];

export async function flowExecute<T extends FlowExecuteCommand>({...args}: FlowApiArgs<T>) {
    try {
        const data = (await ytApiV4Id.flowExecute(
            `${YTApiId.flowExecute}_${args.parameters.flow_command}`,
            {
                ...args,
                data: args.body ?? {},
            },
        )) as FlowExecuteTypes[T]['ResponseType'];

        return {data};
    } catch (error: unknown) {
        return {error} as {error: YTError};
    }
}
