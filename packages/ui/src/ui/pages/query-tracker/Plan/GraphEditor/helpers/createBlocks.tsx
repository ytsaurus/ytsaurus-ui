import {ProcessedGraph} from '../../utils';
import {ECameraScaleLevel, TBlockId} from '@gravity-ui/graph';
import {QueriesNodeBlock} from '../QueriesNodeBlock';
import type {Progress} from '../../models/plan';
import {OperationType} from '../enums';
import {iconToBase} from './iconToBase';
import {getOperationType} from './getOperationType';
import {getBlockIcon} from './getBlockIcon';
import {TConnectionId} from '@gravity-ui/graph/build/store/connection/ConnectionState';
import {TPoint} from '@gravity-ui/graph/build/utils/types/shapes';
import {TMultipointConnection} from '@gravity-ui/graph/build/plugins/elk/types';

const ICON_SIZE = 24;

export const createBlocks = async (
    graph: ProcessedGraph,
    progress: Progress | null,
    positions: {
        edges: Record<TConnectionId, Pick<TMultipointConnection, 'points' | 'labels'>>;
        blocks: Record<TConnectionId, TPoint>;
    },
    level: ECameraScaleLevel,
    sizes: {height: number; width: number},
): Promise<{blocks: QueriesNodeBlock[]; connections: TMultipointConnection[]}> => {
    const isMinimalisticView = level === ECameraScaleLevel.Minimalistic;

    if (Object.keys(positions.blocks).length === 0) return {blocks: [], connections: []};

    const blocks = graph.nodes.map((node) => {
        let name = (node.title || node.id).replace('Yt', '');
        const type = getOperationType(name, node.type);
        const icon = getBlockIcon(type);
        const isTable = type === OperationType.Table;
        let bottomText = isMinimalisticView ? name : undefined;
        if (isTable) {
            name = 'Table';
            bottomText = node.label;
        }

        const {x, y} = positions.blocks[node.id]!;
        return {
            x: x as number,
            y: y as number,
            width: sizes.width,
            height: sizes.height,
            id: node.id as TBlockId,
            is: 'block',
            selected: false,
            name,
            anchors: [],
            meta: {
                level,
                icon: {
                    src: iconToBase(icon, '#657B8F'),
                    height: ICON_SIZE,
                    width: ICON_SIZE,
                },
                bottomText,
                textSize: 14,
                padding: 10,
                nodeProgress: progress ? progress[node.id] : undefined,
                schemas: node.schemas,
                details: node.details,
            },
        };
    });

    const connections = graph.edges.map((edge) => {
        const id = edge.from + '/' + edge.to;
        return {
            id: id,
            sourceBlockId: edge.from,
            targetBlockId: edge.to,
            ...positions.edges[id],
        };
    });

    return {
        blocks,
        connections,
    };
};
