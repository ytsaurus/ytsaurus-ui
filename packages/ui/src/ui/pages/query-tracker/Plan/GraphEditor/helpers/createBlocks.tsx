import React from 'react';
import {ProcessedGraph, ProcessedNode} from '../../utils';
import {TBlockId} from '@gravity-ui/graph';
import {NodeBlockMeta, NodeTBlock} from '../canvas/NodeBlock';
import LayoutHeaderCellsLargeIcon from '@gravity-ui/icons/svgs/layout-header-cells-large.svg';
import MoleculeIcon from '@gravity-ui/icons/svgs/molecule.svg';
import {calculatePositions} from './calculatePositions';
import type {Progress} from '../../models/plan';
import {GraphBlockType, ScaleStep} from '../enums';
import {getScaledSizes} from './getScaledSizes';
import {iconToBase} from './iconToBase';

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
    scale: ScaleStep,
): Promise<NodeTBlock[]> => {
    const percent = 1 / scale;
    const isMinimalisticView = scale === ScaleStep.Minimalistic;
    const sizes = getScaledSizes(scale);

    const elkNodes = await calculatePositions({
        graph,
        sizes,
    });

    if (!elkNodes) return [];

    return graph.nodes.map((node) => {
        const {icon, type} = getBlockConfig(node);

        const isTable = type === 'table';
        let name = node.title || node.id;
        let bottomText = isMinimalisticView ? name : undefined;
        if (isTable) {
            name = 'Table';
            bottomText = node.label;
        }

        const {x, y} = elkNodes[node.id];
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
                scale,
                icon: {
                    src: icon.src,
                    height: icon.height * percent,
                    width: icon.width * percent,
                },
                bottomText,
                textSize: Math.round(11 * percent),
                padding: 10 * percent,
                nodeProgress: progress ? progress[node.id] : undefined,
                schemas: node.schemas,
                details: node.details,
            },
        };
    });
};
