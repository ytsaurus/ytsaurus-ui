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
