import {http} from 'msw';

import {
    type FlowComputationType,
    type FlowDescribePipelineData,
    type FlowExtendedStreamType,
} from '../../../../../../shared/yt-types';

export const SOURCE_NAME = 'Pipeline source';
export const INPUT_ONLY_STREAM_NAME = 'Input-only stream';
export const INPUT_ONLY_SINK_NAME = 'Input-only sink';
export const ISOLATED_STREAM_NAME = 'Isolated stream';
export const MESSAGE_TEXT = 'The stream has diagnostic messages';

const SOURCE_STREAM_ID = 'source-stream';
const INPUT_ONLY_STREAM_ID = 'input-only-stream';
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

function makeComputation(
    extendedSourceStream?: FlowExtendedStreamType,
    sourceStreams = [SOURCE_STREAM_ID],
    inputStreams: Array<string> = [],
): FlowComputationType {
    return {
        id: 'computation',
        name: 'Computation',
        status: 'info',
        class_name: 'TTestComputation',
        cpu_usage: 0.25,
        memory_usage: 1024,
        group_by_schema_str: 'key: string',
        epoch_per_second: 10,
        partitions_stats: {
            count: 2,
            count_by_state: {
                completed: 0,
                executing: 2,
                interrupted: 0,
                transient: 0,
            },
        },
        input_streams: inputStreams,
        output_streams: [OUTPUT_STREAM_ID],
        source_streams: sourceStreams,
        timer_streams: [],
        key_visitor_streams: [],
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

function makeInputOnlyStreamFlowGraphResponse(): FlowDescribePipelineData {
    const response = makeFlowGraphResponse();

    response.computations.computation = makeComputation(
        undefined,
        [SOURCE_STREAM_ID],
        [INPUT_ONLY_STREAM_ID],
    );
    response.streams[INPUT_ONLY_STREAM_ID] = {
        id: INPUT_ONLY_STREAM_ID,
        name: INPUT_ONLY_STREAM_NAME,
        status: 'info',
        bytes_per_second: 0,
        messages_per_second: 0,
        inflight_bytes: 0,
        inflight_rows: 0,
    };
    response.sinks.sink = {
        ...response.sinks.sink,
        name: INPUT_ONLY_SINK_NAME,
        stream_id: INPUT_ONLY_STREAM_ID,
    };
    response.streams['isolated-stream'] = {
        id: 'isolated-stream',
        name: ISOLATED_STREAM_NAME,
        status: 'info',
        bytes_per_second: 0,
        messages_per_second: 0,
        inflight_bytes: 0,
        inflight_rows: 0,
    };

    return response;
}

export const inputOnlyStreamFlowGraphHandler = makeFlowGraphHandler(
    makeInputOnlyStreamFlowGraphResponse(),
);

export const MULTIPLE_SOURCES = ['A', 'B', 'C'].map((key) => ({
    sourceId: `source-${key.toLowerCase()}`,
    sourceName: `Source ${key}`,
    streamName: `Source stream ${key}`,
    streamId: `source-stream-${key}`,
}));

// Sources are listed in the order of the computation's source streams, and ELK alone lays them out
// bottom-up, so their connections cross unless the graph reorders them.
function makeMultipleSourcesFlowGraphResponse(): FlowDescribePipelineData {
    const {
        streams: {[SOURCE_STREAM_ID]: sourceStream, ...streams},
        sinks,
    } = makeFlowGraphResponse();
    return {
        computations: {
            computation: makeComputation(
                undefined,
                MULTIPLE_SOURCES.map(({streamId}) => streamId),
            ),
        },
        streams: {
            ...streams,
            ...Object.fromEntries(
                MULTIPLE_SOURCES.map(({streamId, streamName}) => [
                    streamId,
                    {...sourceStream, id: streamId, name: streamName},
                ]),
            ),
        },
        sources: Object.fromEntries(
            MULTIPLE_SOURCES.map(({sourceId, sourceName, streamId}) => [
                sourceId,
                {id: sourceId, name: sourceName, status: 'info', stream_id: streamId},
            ]),
        ),
        sinks,
    };
}

export const multipleSourcesFlowGraphHandler = makeFlowGraphHandler(
    makeMultipleSourcesFlowGraphResponse(),
);

const DATA_CHANNEL_ID = 'yt:primary://home/flow/audit_queue';

// A sink of one computation writes a queue that a source of another computation reads.
function makeDataChannelFlowGraphResponse(): FlowDescribePipelineData {
    const {streams, sources} = makeFlowGraphResponse();
    const writer = makeComputation();
    const reader = {
        ...makeComputation(undefined, ['audit-source-stream']),
        id: 'reader',
        name: 'Reader',
        output_streams: ['reader-output-stream'],
    };
    return {
        computations: {computation: writer, reader},
        streams: {
            ...streams,
            'audit-source-stream': {
                ...streams[SOURCE_STREAM_ID],
                id: 'audit-source-stream',
                name: 'Audit source stream',
            },
            'reader-output-stream': {
                ...streams[OUTPUT_STREAM_ID],
                id: 'reader-output-stream',
                name: 'Reader output stream',
            },
        },
        sources: {
            ...sources,
            'audit-source': {
                id: 'audit-source',
                name: 'Audit source',
                status: 'info',
                stream_id: 'audit-source-stream',
            },
        },
        sinks: {
            'audit-sink': {
                id: 'audit-sink',
                name: 'Audit sink',
                status: 'info',
                stream_id: OUTPUT_STREAM_ID,
            },
        },
        edges: [
            {from: 'audit-sink', to: 'audit-source', kind: 'data_channel', label: DATA_CHANNEL_ID},
            {
                from: 'missing-sink',
                to: 'audit-source',
                kind: 'data_channel',
                label: 'yt:primary://home/flow/missing',
            },
            {from: 'audit-sink', to: 'source', kind: 'unknown_kind', label: 'ignored'},
        ],
    };
}

export const dataChannelFlowGraphHandler = makeFlowGraphHandler(makeDataChannelFlowGraphResponse());

export const MULTIPLE_SINKS = ['A', 'B', 'C'].map((key) => ({
    sinkId: `sink-${key.toLowerCase()}`,
    sinkName: `Sink ${key}`,
    streamName: `Output stream ${key}`,
    streamId: `output-stream-${key}`,
}));

function makeMultipleSinksFlowGraphResponse(): FlowDescribePipelineData {
    const response = makeFlowGraphResponse();
    const outputStream = response.streams[OUTPUT_STREAM_ID];
    delete response.streams[OUTPUT_STREAM_ID];
    response.computations.computation.output_streams = MULTIPLE_SINKS.map(({streamId}) => streamId);
    MULTIPLE_SINKS.forEach(({streamId, streamName}) => {
        response.streams[streamId] = {...outputStream, id: streamId, name: streamName};
    });
    response.sinks = Object.fromEntries(
        MULTIPLE_SINKS.map(({sinkId, sinkName, streamId}) => [
            sinkId,
            {id: sinkId, name: sinkName, status: 'info', stream_id: streamId},
        ]),
    );
    return response;
}

export const multipleSinksFlowGraphHandler = makeFlowGraphHandler(
    makeMultipleSinksFlowGraphResponse(),
);

// The writer has a timer, a second output stream and visits its own state; the visitor visits a state table of
// the writer and the table of a sink. As in the describe response, the computations are keyed apart from their graph ids.
function makeKeyVisitorFlowGraphResponse(): FlowDescribePipelineData {
    const {streams, sources, sinks} = makeFlowGraphResponse();
    const writer: FlowComputationType = {
        ...makeComputation(),
        output_streams: [OUTPUT_STREAM_ID, 'second-output-stream'],
        timer_streams: ['timer-stream'],
        key_visitor_streams: ['own-visit-stream'],
    };
    const visitor: FlowComputationType = {
        ...makeComputation(undefined, [], ['second-output-stream']),
        id: 'visitor',
        name: 'Visitor',
        output_streams: ['visitor-output-stream'],
        key_visitor_streams: ['joiner-visit-stream', 'sink-table-visit-stream'],
        extended_key_visitor_streams: [
            {...makeExtendedStream({drained: true}), stream_graph_entity_id: 'joiner-visit-stream'},
        ],
    };
    const names: Record<string, string> = {
        'second-output-stream': 'Second output stream',
        'timer-stream': 'Timer stream',
        'own-visit-stream': 'Own state visit',
        'joiner-visit-stream': 'Joiner visit',
        'sink-table-visit-stream': 'Sink table visit',
        'visitor-output-stream': 'Visitor output stream',
    };
    return {
        computations: {writer, visitor},
        streams: {
            ...streams,
            ...Object.fromEntries(
                Object.entries(names).map(([id, name]) => [
                    id,
                    {...streams[OUTPUT_STREAM_ID], id, name},
                ]),
            ),
        },
        sources,
        sinks,
        edges: [
            {from: 'computation', to: 'own-visit-stream', kind: 'data_channel'},
            {
                from: 'computation',
                to: 'joiner-visit-stream',
                kind: 'data_channel',
                label: 'yt:primary://home/flow/state',
            },
            {
                from: 'sink',
                to: 'sink-table-visit-stream',
                kind: 'data_channel',
                label: 'yt:primary://home/flow/sink_table',
            },
        ],
    };
}

export const keyVisitorFlowGraphHandler = makeFlowGraphHandler(makeKeyVisitorFlowGraphResponse());

// A dense computation with a source, fed by the producer: own-state visits alternate with visits fed by the producer
// and the sink. As in the describe response, the dense computation is keyed apart from its graph id.
function makeDenseFlowGraphResponse(): FlowDescribePipelineData {
    const {streams, sources, sinks} = makeFlowGraphResponse();
    const ids = (prefix: string, count: number) =>
        Array.from({length: count}, (_, i) => `${prefix}-${i + 1}`);
    const dense: FlowComputationType = {
        ...makeComputation(undefined, ['dense-source-stream'], [OUTPUT_STREAM_ID]),
        id: 'cmp-dense',
        name: 'Dense',
        output_streams: ids('dense-output', 4),
        timer_streams: ids('dense-timer', 3),
        key_visitor_streams: ids('dense-visit', 4),
    };
    const denseStreamIds = [
        ...dense.source_streams,
        ...dense.output_streams,
        ...dense.timer_streams,
        ...dense.key_visitor_streams,
    ];
    const visitFrom = [dense.id, 'computation', dense.id, 'sink'];
    return {
        computations: {computation: makeComputation(), dense},
        streams: {
            ...streams,
            ...Object.fromEntries(
                denseStreamIds.map((id) => [id, {...streams[OUTPUT_STREAM_ID], id, name: id}]),
            ),
        },
        sources: {
            ...sources,
            'dense-source': {
                id: 'dense-source',
                name: 'Dense source',
                status: 'info',
                stream_id: 'dense-source-stream',
            },
        },
        sinks,
        edges: dense.key_visitor_streams.map((to, i) => ({
            from: visitFrom[i],
            to,
            kind: 'data_channel',
        })),
    };
}

export const denseFlowGraphHandler = makeFlowGraphHandler(makeDenseFlowGraphResponse());
