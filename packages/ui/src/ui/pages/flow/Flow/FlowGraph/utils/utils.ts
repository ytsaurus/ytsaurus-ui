import {
    type TAnchor,
    type TBlock,
    type TBlockId,
    type TConnection,
    type TMultipointConnection,
} from '@gravity-ui/graph';
import sortBy_ from 'lodash/sortBy';
import {v4 as uuidv4} from 'uuid';
import {
    type FlowComputationType,
    type FlowExtendedStreamType,
} from '../../../../../../shared/yt-types';
import {GRAPH_COLORS} from '../../../../../components/YTGraph/constants';
import {type YTGraphBlock} from '../../../../../components/YTGraph/types';
import {
    type FlowComputationRuntimeData,
    type FlowComputationRuntimeType,
    type FlowComputationUIStreamsSummary,
} from '../../types';
import {type FlowGraphBlock, type FlowGraphBlockItem} from '../FlowGraph';

export type FlowStreamStatus = {
    drained: boolean;
    backpressureDetected: boolean;
};

export type FlowGraphConnection = TConnection & {
    flowStreamStatus?: FlowStreamStatus;
};

export function mergeConnectionStreamStatus(dst: FlowGraphConnection, status?: FlowStreamStatus) {
    if (!status) {
        return;
    }

    const flowStreamStatus = {
        drained: Boolean(dst.flowStreamStatus?.drained || status.drained),
        backpressureDetected: Boolean(
            dst.flowStreamStatus?.backpressureDetected || status.backpressureDetected,
        ),
    };

    dst.flowStreamStatus = flowStreamStatus;
    let background;
    if (flowStreamStatus.backpressureDetected) {
        background = GRAPH_COLORS.warningLine;
    } else if (flowStreamStatus.drained) {
        background = GRAPH_COLORS.infoLine;
    }

    if (background) {
        dst.styles = {...dst.styles, background};
    }
}

export function applyConnectionStyle(
    dst: FlowGraphConnection,
    {
        drained,
        backpressure_detected,
    }: Partial<Pick<FlowExtendedStreamType, 'drained' | 'backpressure_detected'>>,
) {
    mergeConnectionStreamStatus(dst, {
        drained: Boolean(drained),
        backpressureDetected: Boolean(backpressure_detected),
    });
}

const uuid = uuidv4();

/**
 * Avoid collision with real ids from response
 * @param id
 * @returns
 */
function flowRuntimeId(id: string) {
    return `${id}__${uuid}`;
}

export const COMPUTATION_IN = 'COMPUTATION_IN';
export const COMPUTATION_OUT = 'COMPUTATION_OUT';
export const COMPUTATION_TIMER_IN = 'COMPUTATION_TIMER_IN';
export const COMPUTATION_TIMER_OUT = 'COMPUTATION_TIMER_OUT';

const COMPUTATION_ANCHOR_TYPES = [
    COMPUTATION_IN,
    COMPUTATION_OUT,
    COMPUTATION_TIMER_IN,
    COMPUTATION_TIMER_OUT,
];

export type FlowComputationAnchorType = (typeof COMPUTATION_ANCHOR_TYPES)[number];

export const COMPUTATION_ANCHOR_SIZE = 24;

export function addComputationInOut(dstBlock: TBlock) {
    dstBlock.anchors = dstBlock.anchors ?? [];

    const targetAnchorId = flowRuntimeId(`${COMPUTATION_IN}_${dstBlock.id}`);
    const anchorIn: TAnchor = {
        id: targetAnchorId,
        blockId: dstBlock.id,
        type: COMPUTATION_IN,
        index: dstBlock.anchors.length,
    };

    const sourceAnchorId = flowRuntimeId(`${COMPUTATION_OUT}_${dstBlock.id}`);
    const anchorOut: TAnchor = {
        id: sourceAnchorId,
        blockId: dstBlock.id,
        type: COMPUTATION_OUT,
        index: dstBlock.anchors.length,
    };

    dstBlock.anchors?.push(anchorIn, anchorOut);

    return {sourceAnchorId, targetAnchorId};
}

function makeFlowStreamsSummary(): FlowComputationUIStreamsSummary {
    return {
        drained: false,
        backpressureDetected: false,
        messages: [],
        extendedStreams: new Map<string, FlowExtendedStreamType>(),
    };
}

export function makeFlowComputationRuntimeData(
    computation: FlowComputationType,
): FlowComputationRuntimeData {
    const input = makeFlowStreamsSummary();
    const output = makeFlowStreamsSummary();
    const timer = makeFlowStreamsSummary();

    function collectStreamsSummary(
        dstSummary: FlowComputationUIStreamsSummary,
        info: Array<FlowExtendedStreamType>,
    ) {
        return info.reduce((acc, item) => {
            dstSummary.drained = dstSummary.drained || item.drained;
            dstSummary.backpressureDetected =
                dstSummary.backpressureDetected || item.backpressure_detected;
            dstSummary.messages.push(...item.messages);

            acc.set(item.stream_graph_entity_id, item);
            return acc;
        }, dstSummary.extendedStreams);
    }

    collectStreamsSummary(input, computation.extended_input_streams);
    collectStreamsSummary(output, computation.extended_output_streams);
    collectStreamsSummary(input, computation.extended_source_streams);
    collectStreamsSummary(timer, computation.extended_timer_streams);

    return {
        input,
        output,
        timer,
    };
}

export function addFlowConnection(
    dstConnections: Array<FlowGraphConnection>,
    sourceBlockId: TBlockId,
    targetBlockId: TBlockId,
    {
        ...restOptions
    }: Pick<
        FlowGraphConnection,
        'flowStreamStatus' | 'styles' | 'sourceAnchorId' | 'targetAnchorId'
    > = {},
) {
    const c: FlowGraphConnection = {
        ...restOptions,
        sourceBlockId,
        targetBlockId,
    };
    dstConnections.push(c);

    return c;
}

export function makeBlock<
    T extends FlowGraphBlock['is'],
    D extends FlowGraphBlockItem<T>,
    O extends Partial<D>,
>(type: T, item: D['meta'], options: O) {
    return {
        id: item.id,
        is: type,
        name: item.name ?? item.id,
        selected: false,
        anchors: [],
        ...options,
        meta: item,
        // the values should be overriden by layout process
        x: 0,
        y: 0,
    };
}

export function makeTimerAnchors(src: TBlock, dst: TBlock, c: TConnection) {
    const srcAnchor: TAnchor = {
        id: flowRuntimeId(`${COMPUTATION_TIMER_IN}_${src.id as string}:${dst.id as string}:`),
        blockId: src.id,
        type: COMPUTATION_TIMER_IN,
    };
    const dstAnchor: TAnchor = {
        id: flowRuntimeId(`${COMPUTATION_TIMER_OUT}_${src.id as string}:${dst.id as string}:`),
        blockId: dst.id,
        type: COMPUTATION_TIMER_OUT,
    };

    src.anchors?.push({...srcAnchor, index: src.anchors.length});
    dst.anchors?.push({...dstAnchor, index: dst.anchors.length});

    c.targetAnchorId = dstAnchor.id;
    c.sourceAnchorId = srcAnchor.id;
}

type LaidOutConnection = Pick<TConnection, 'sourceBlockId' | 'targetBlockId'> &
    Partial<Pick<TMultipointConnection, 'points' | 'labels'>>;

// Each source feeds exactly one source stream, so the laid-out slots of a group's sources
// (positions together with the routes of their edges) can be handed out in the order of the
// group's source streams: source -> source stream connections stop crossing, while the source
// streams and the rest of the graph stay where they were.
export function orderSourcesLikeSourceStreams<
    B extends Pick<TBlock, 'id' | 'x' | 'y'>,
    C extends LaidOutConnection,
>(
    {blocks, connections}: {blocks: Array<B>; connections: Array<C>},
    sourceIdsByGroupId: Map<TBlockId, Array<TBlockId>>,
) {
    const blockById = new Map(blocks.map((item) => [item.id, item]));
    const edgeKey = (source?: TBlockId, target?: TBlockId) => `${source}->${target}`;
    const edgeByKey = new Map(
        connections.map((item) => [edgeKey(item.sourceBlockId, item.targetBlockId), item]),
    );

    const positionById = new Map<TBlockId, Pick<B, 'x' | 'y'>>();
    const routeByEdgeKey = new Map<string, Pick<C, 'points' | 'labels'>>();

    sourceIdsByGroupId.forEach((sourceIds, groupId) => {
        const slots = sourceIds.flatMap((id) => {
            const block = blockById.get(id);
            const edge = edgeByKey.get(edgeKey(id, groupId));
            return block && edge ? [{block, edge}] : [];
        });
        if (slots.length < 2 || slots.length !== sourceIds.length) {
            return;
        }

        sortBy_(slots, ({block}) => block.y).forEach(({block, edge}, index) => {
            const id = sourceIds[index];
            positionById.set(id, {x: block.x, y: block.y});
            routeByEdgeKey.set(edgeKey(id, groupId), {points: edge.points, labels: edge.labels});
        });
    });

    return {
        blocks: blocks.map((item) => {
            const position = positionById.get(item.id);
            return position ? {...item, ...position} : item;
        }),
        connections: connections.map((item) => {
            const route = routeByEdgeKey.get(edgeKey(item.sourceBlockId, item.targetBlockId));
            return route ? {...item, ...route} : item;
        }),
    };
}

export function hasVisibleStreamsSummaryDetails(
    data?: FlowComputationUIStreamsSummary,
): data is FlowComputationUIStreamsSummary {
    if (!data) {
        return false;
    }
    return data.messages.length > 0 || data.drained || data.backpressureDetected;
}

export function getStreamsSummaryByAnchorType(
    block: FlowComputationRuntimeType,
    type: FlowComputationAnchorType,
) {
    const {runtimeData} = block;

    switch (type) {
        case COMPUTATION_IN:
            return runtimeData.input;
        case COMPUTATION_OUT:
            return runtimeData.output;
        case COMPUTATION_TIMER_IN:
        case COMPUTATION_TIMER_OUT:
            return runtimeData.timer;
    }

    return undefined;
}

export function isComputationAnchorType(type: string): type is FlowComputationAnchorType {
    return COMPUTATION_ANCHOR_TYPES.includes(type as FlowComputationAnchorType);
}

export function isFlowComputationOrGroup(
    block?: FlowGraphBlock,
): block is
    | YTGraphBlock<'computation-group', FlowComputationRuntimeType>
    | YTGraphBlock<'computation', FlowComputationRuntimeType> {
    return block?.is === 'computation' || block?.is === 'computation-group';
}
