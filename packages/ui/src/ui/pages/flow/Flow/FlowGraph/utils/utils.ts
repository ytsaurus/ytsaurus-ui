import {TAnchor, TBlock, TBlockId, TConnection} from '@gravity-ui/graph';
import {v4 as uuidv4} from 'uuid';
import {
    type FlowComputationType,
    type FlowExtendedStremType,
} from '../../../../../../shared/yt-types';
import {GRAPH_COLORS} from '../../../../../components/YTGraph/constants';
import {
    FlowComputationRuntimeData,
    FlowComputationRuntimeType,
    FlowComputationUIStreamsSummary,
} from '../../types';
import {FlowGraphBlock, FlowGraphBlockItem} from '../FlowGraph';

export function applyConnectionStyle(
    dst: TConnection,
    {
        drained,
        backpressure_detected,
    }: Partial<Pick<FlowExtendedStremType, 'drained' | 'backpressure_detected'>>,
) {
    dst.styles = Object.assign(
        {},
        dst.styles,
        drained ? {background: GRAPH_COLORS.infoLine} : {},
        backpressure_detected ? {background: GRAPH_COLORS.warningLine} : {},
    );
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
        extendedStreams: new Map<string, FlowExtendedStremType>(),
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
        info: Array<FlowExtendedStremType>,
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
    dstConnections: Array<TConnection>,
    sourceBlockId: TBlockId,
    targetBlockId: TBlockId,
    {...restOptions}: Pick<TConnection, 'styles' | 'sourceAnchorId' | 'targetAnchorId'> = {},
) {
    const c: TConnection = {
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

export function hasVisibleStreamsSummaryDetails(
    data?: FlowComputationUIStreamsSummary,
): data is FlowComputationUIStreamsSummary {
    if (!data) {
        return false;
    }
    return data.messages.length > 0 || data.drained || data.backpressureDetected;
}

export function getStreamsSummmaryByAnchorType(
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
