import {ProcessedGraph} from '../../utils';
import {ECameraScaleLevel} from '@gravity-ui/graph';
import {QueriesNodeBlock} from '../QueriesNodeBlock';
import type {Progress} from '../../models/plan';
import {OperationType} from '../enums';
import {iconToBase} from '../../../../../components/YTGraph/utils/iconToBase';
import {getOperationType} from './getOperationType';
import {getBlockIcon} from './getBlockIcon';
import {MultipointConnection} from '../types';

export const createBlocks = (
    graph: ProcessedGraph,
    progress: Progress | undefined,
    level: ECameraScaleLevel,
): {blocks: QueriesNodeBlock[]; connections: MultipointConnection[]} => {
    const isMinimalisticView = level === ECameraScaleLevel.Minimalistic;

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

        return {
            x: NaN,
            y: NaN,
            ...{level: node.level},
            width: 100,
            height: 100,
            id: node.id as string,
            is: 'block',
            selected: false,
            name,
            anchors: [],
            meta: {
                level,
                icon: {
                    src: iconToBase(icon),
                },
                bottomText,
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
        };
    });

    return {
        blocks,
        connections,
    };
};
