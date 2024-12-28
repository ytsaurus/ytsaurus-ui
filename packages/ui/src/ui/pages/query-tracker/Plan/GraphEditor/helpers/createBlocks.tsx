import {ProcessedGraph} from '../../utils';
import {ECameraScaleLevel, TBlockId} from '@gravity-ui/graph';
import {NodeTBlock} from '../canvas/NodeBlock';
import type {Progress} from '../../models/plan';
import {OperationType} from '../enums';
import {iconToBase} from './iconToBase';
import {TElkTConnection} from '../connections/ELKConnection';
import {ElkNode} from 'elkjs';
import {getOperationType} from './getOperationType';
import {getBlockIcon} from './getBlockIcon';

const ICON_SIZE = 24;

export const createBlocks = async (
    graph: ProcessedGraph,
    progress: Progress | null,
    positions: ElkNode,
    level: ECameraScaleLevel,
    sizes: {height: number; width: number},
): Promise<{blocks: NodeTBlock[]; connections: TElkTConnection[]}> => {
    const isMinimalisticView = level === ECameraScaleLevel.Minimalistic;

    if (!positions.children) return {blocks: [], connections: []};

    const map = new Map(positions.children.map((i) => [i.id, i]));

    const blocks = graph.nodes.map((node) => {
        let name = node.title || node.id;
        const type = getOperationType(name, node.type);
        const icon = getBlockIcon(type);
        const isTable = type === OperationType.Table;
        let bottomText = isMinimalisticView ? name : undefined;
        if (isTable) {
            name = 'Table';
            bottomText = node.label;
        }

        const {x, y} = map.get(node.id)!;
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

    const connections = positions.edges?.reduce<TElkTConnection[]>((acc, c) => {
        acc.push({
            id: c.id as string,
            sourceBlockId: c.sources[0] as string,
            targetBlockId: c.targets[0] as string,
            elk: c,
        });

        return acc;
    }, []);

    return {
        blocks,
        connections: connections || [],
    };
};
