import React from 'react';

import {ElkExtendedEdge} from 'elkjs/lib/elk-api';
import {CanvasBlock, HookGraphParams, MultipointConnection} from '@gravity-ui/graph';
import {RecursivePartial} from '@gravity-ui/graph/build/utils/types/helpers';
import {TGraphColors} from '@gravity-ui/graph/build/graphConfig';

import {getCssColor} from '../../utils/get-css-color';
import {BaseMeta, NodeBlock, NodeTBlock} from './canvas/NodeBlock';

export const getGraphColors = (): RecursivePartial<TGraphColors> => {
    return {
        connection: {
            background: getCssColor('--yql-graph-color-edge'),
            selectedBackground: getCssColor('--yql-graph-color-edge-highlight'),
        },
        block: {
            background: getCssColor('--g-color-base-generic-ultralight'),
            selectedBorder: getCssColor('--yql-graph-color-edge-highlight'),
            border: getCssColor('--yql-graph-color-edge'),
            text: getCssColor('--yql-graph-color-text-label'),
        },
    };
};

export function useConfig<T extends NodeTBlock<BaseMeta>>(
    block?: typeof CanvasBlock<T>,
): {config: HookGraphParams; isBlock: (v: unknown) => v is CanvasBlock<T>} {
    return React.useMemo(() => {
        const b = block ?? NodeBlock;
        const config = {
            settings: {
                connection: MultipointConnection,
                canDuplicateBlocks: false,
                canCreateNewConnections: false,
                canZoomCamera: true,
                blockComponents: {block: b},
            },
            viewConfiguration: {
                colors: {
                    ...getGraphColors(),
                },
            },
        };
        return {
            config,
            isBlock: (v: unknown) => {
                return v instanceof b;
            },
        };
    }, [block]);
}

export const getElkConfig = (
    children: {id: string; level: number}[],
    edges: ElkExtendedEdge[],
    sizes: {height: number; width: number},
) => {
    return {
        id: 'root',
        children: children.map((node) => ({
            id: node.id,
            width: sizes.width,
            height: sizes.height,
            ...(node.level === 1
                ? {
                      layoutOptions: {
                          'elk.layered.layering.layerConstraint': '1',
                      },
                  }
                : {}),
        })),
        edges,
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': 'RIGHT',
            'spacing.nodeNode': sizes.height.toString(), // Node horizontal spacing
            'spacing.nodeNodeBetweenLayers': Math.round(sizes.height / 2).toString(), // Layer spacing
            'spacing.edgeNode': '25', // Nodes and edges spacing
            'spacing.edgeEdge': '25', // Edges spacing
            'spacing.edgeEdgeBetweenLayers': '35', // Distance between edges in layers
            'spacing.edgeNodeBetweenLayers': '25', // Distance between nodes and edges in layers
            'nodePlacement.strategy': 'TIGHT_TREE', // Node placement strategy
            'elk.layered.nodePlacement.bk.fixedAlignment': 'CENTER', // Node alignment
            'elk.layered.crossingMinimization.strategy': 'LAYER_PER_LAYER_SWEEP',
            'elk.layered.thoroughness': '200', // Level of detail
            'elk.portConstraints': 'FREE',
        },
    };
};
