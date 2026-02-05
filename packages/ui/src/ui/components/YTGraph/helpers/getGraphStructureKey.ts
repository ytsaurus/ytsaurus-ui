import {TBlock, TConnection} from '@gravity-ui/graph';
import {YTGraphData} from '../types';

export function getGraphStructureKey<B extends TBlock, C extends TConnection>(
    data: YTGraphData<B, C>,
): string {
    const blockIds = data.blocks
        .map((b) => String(b.id))
        .sort()
        .join(',');
    const connectionIds = data.connections
        .map((c) => `${String(c.sourceBlockId)}-${String(c.targetBlockId)}`)
        .sort()
        .join(',');
    return `${blockIds}|${connectionIds}`;
}
