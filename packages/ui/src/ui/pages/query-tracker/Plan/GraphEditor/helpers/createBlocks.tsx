import React from 'react';
import {ProcessedGraph, ProcessedNode} from '../../utils';
import {ECameraScaleLevel, TBlockId} from '@gravity-ui/graph';
import {NodeBlockMeta, NodeTBlock} from '../canvas/NodeBlock';
import LayoutHeaderCellsLargeIcon from '@gravity-ui/icons/svgs/layout-header-cells-large.svg';
import MoleculeIcon from '@gravity-ui/icons/svgs/molecule.svg';
import type {Progress} from '../../models/plan';
import {GraphBlockType} from '../enums';
import {iconToBase} from './iconToBase';
import {TElkTConnection} from '../connections/ELKConnection';
import {ElkNode} from 'elkjs';

const getBlockConfig = (
    node: ProcessedNode,
): {
    type: 'table' | 'operation';
    icon: NodeBlockMeta['icon'];
    background: string;
} => {
    switch (node.type) {
        case 'in':
        case 'out':
            return {
                type: GraphBlockType.Table,
                icon: {
                    src: iconToBase(<LayoutHeaderCellsLargeIcon />, '#657B8F'),
                    height: 16,
                    width: 16,
                },
                background: '#fff',
            };
        default:
            return {
                type: GraphBlockType.Operation,
                icon: {
                    src: iconToBase(<MoleculeIcon />, '#657B8F'),
                    height: 16,
                    width: 16,
                },
                background: '#fff',
            };
    }
};

export const createBlocks = async (
    graph: ProcessedGraph,
    progress: Progress | null,
    positions: ElkNode,
    level: ECameraScaleLevel,
): Promise<{blocks: NodeTBlock[]; connections: TElkTConnection[]}> => {
    const isMinimalisticView = level === ECameraScaleLevel.Minimalistic;
    const sizes = {
        block: {height: 70, width: 70},
        layout: {vertical: 70, horizontal: 70},
    };

    if (!positions.children) return {blocks: [], connections: []};

    const map = new Map(positions.children.map((i) => [i.id, i]));
    const blocks = graph.nodes.map((node) => {
        const {icon, type} = getBlockConfig(node);

        const isTable = type === 'table';
        let name = node.title || node.id;
        let bottomText = isMinimalisticView ? name : undefined;
        if (isTable) {
            name = 'Table';
            bottomText = node.label;
        }

        const {x, y} = map.get(node.id)!;
        return {
            x: x as number,
            y: y as number,
            width: sizes.block.width,
            height: sizes.block.height,
            id: node.id as TBlockId,
            is: type,
            selected: false,
            name,
            anchors: [],
            meta: {
                level,
                icon: {
                    src: icon.src,
                    height: icon.height,
                    width: icon.width,
                },
                bottomText,
                textSize: 11,
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
