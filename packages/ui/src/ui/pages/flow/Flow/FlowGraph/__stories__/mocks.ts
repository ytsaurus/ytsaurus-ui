import {http} from 'msw';

import {
    type FlowComputationType,
    type FlowDescribePipelineData,
    type FlowExtendedStreamType,
} from '../../../../../../../shared/yt-types';

export const SOURCE_NAME = 'Pipeline source';
export const MESSAGE_TEXT = 'The stream has diagnostic messages';

const SOURCE_STREAM_ID = 'source-stream';
const OUTPUT_STREAM_ID = 'output-stream';

function makeExtendedStream(
    data: Partial<Pick<FlowExtendedStreamType, 'backpressure_detected' | 'drained' | 'messages'>>,
): FlowExtendedStreamType {
    return {
        backpressure_detected: false,
        completed: false,
        drained: false,
        messages: [],
        stream_graph_entity_id: SOURCE_STREAM_ID,
        ...data,
    };
}

function makeComputation(extendedSourceStream?: FlowExtendedStreamType): FlowComputationType {
    return {
        id: 'computation',
        name: 'Computation',
        status: 'info',
        class_name: 'TTestComputation',
        cpu_usage: 0.25,
        memory_usage: 1024,
        group_by_schema_str: 'key: string',
        epoch_per_second: 10,
        partitions_stats: {count: 2, count_by_state: {executing: 2}},
        input_streams: [],
        output_streams: [OUTPUT_STREAM_ID],
        source_streams: [SOURCE_STREAM_ID],
        timer_streams: [],
        extended_input_streams: [],
        extended_output_streams: [],
        extended_source_streams: extendedSourceStream ? [extendedSourceStream] : [],
        extended_timer_streams: [],
    };
}

function makeFlowGraphResponse(
    extendedSourceStream?: FlowExtendedStreamType,
): FlowDescribePipelineData {
    return {
        computations: {computation: makeComputation(extendedSourceStream)},
        streams: {
            [SOURCE_STREAM_ID]: {
                id: SOURCE_STREAM_ID,
                name: 'Source stream',
                status: 'info',
                bytes_per_second: 128,
                messages_per_second: 4,
                inflight_bytes: 0,
                inflight_rows: 0,
            },
            [OUTPUT_STREAM_ID]: {
                id: OUTPUT_STREAM_ID,
                name: 'Output stream',
                status: 'info',
                bytes_per_second: 256,
                messages_per_second: 8,
                inflight_bytes: 64,
                inflight_rows: 1,
            },
        },
        sources: {
            source: {
                id: 'source',
                name: SOURCE_NAME,
                status: 'info',
                stream_id: SOURCE_STREAM_ID,
            },
        },
        sinks: {
            sink: {
                id: 'sink',
                name: 'Pipeline sink',
                status: 'info',
                stream_id: OUTPUT_STREAM_ID,
            },
        },
    };
}

function makeFlowGraphHandler(response: FlowDescribePipelineData) {
    return http.put('*/api/v4/flow_execute', () => Response.json(response));
}

export const drainedFlowGraphHandler = makeFlowGraphHandler(
    makeFlowGraphResponse(makeExtendedStream({drained: true})),
);

export const backpressuredFlowGraphHandler = makeFlowGraphHandler(
    makeFlowGraphResponse(makeExtendedStream({backpressure_detected: true})),
);

export const mixedFlowGraphHandler = makeFlowGraphHandler(
    makeFlowGraphResponse(makeExtendedStream({backpressure_detected: true, drained: true})),
);

export const messagesFlowGraphHandler = makeFlowGraphHandler(
    makeFlowGraphResponse(makeExtendedStream({messages: [{level: 'info', text: MESSAGE_TEXT}]})),
);

export const emptyFlowGraphHandler = makeFlowGraphHandler(makeFlowGraphResponse());
