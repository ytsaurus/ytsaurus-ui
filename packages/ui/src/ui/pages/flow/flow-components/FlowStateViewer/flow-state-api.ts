import {TYPED_INPUT_FORMAT, TYPED_OUTPUT_FORMAT} from '../../../../constants';
import {YTApiId, ytApiV4, ytApiV4Id} from '../../../../rum/rum-wrap-api';

import {normalizeReadStatesResponse} from './helpers';
import type {
    FlowDeleteStatesBody,
    FlowDeleteStatesResponse,
    FlowPipelineSpecData,
    FlowPipelineStateValue,
    FlowReadStatesBody,
} from './types';

type FlowStateExecuteFn = (
    id: string,
    args: {
        parameters: {flow_command: string; pipeline_path: string} & Record<string, unknown>;
        data: unknown;
    },
) => Promise<unknown>;

const rawFlowExecute = ytApiV4Id.flowExecute as unknown as FlowStateExecuteFn;

function flowStateExecute<TResponse>(
    flowCommand: 'read-states' | 'delete-states',
    pipeline_path: string,
    body: object,
    extraParameters?: Record<string, unknown>,
): Promise<TResponse> {
    return rawFlowExecute(`${YTApiId.flowExecute}_${flowCommand}`, {
        parameters: {flow_command: flowCommand, pipeline_path, ...extraParameters},
        data: body,
    }) as Promise<TResponse>;
}

export function flowReadStates(pipeline_path: string, body: FlowReadStatesBody) {
    return flowStateExecute<unknown>('read-states', pipeline_path, body, {
        input_format: TYPED_INPUT_FORMAT,
        output_format: TYPED_OUTPUT_FORMAT,
    }).then(normalizeReadStatesResponse);
}

export function flowDeleteStates(pipeline_path: string, body: FlowDeleteStatesBody) {
    return flowStateExecute<FlowDeleteStatesResponse>('delete-states', pipeline_path, body, {
        input_format: TYPED_INPUT_FORMAT,
    });
}

export function fetchPipelineState(pipeline_path: string) {
    return ytApiV4.getPipelineState({
        parameters: {pipeline_path},
    }) as Promise<FlowPipelineStateValue>;
}

export function fetchSpec(pipeline_path: string) {
    return ytApiV4.getPipelineSpec({parameters: {pipeline_path}}) as Promise<FlowPipelineSpecData>;
}
