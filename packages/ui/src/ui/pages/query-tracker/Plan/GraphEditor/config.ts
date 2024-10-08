import {HookGraphParams, MultipointConnection} from '@gravity-ui/graph';
import {getColor} from './helpers/getColor';
import {NodeBlock} from './canvas/NodeBlock';
import {ElkExtendedEdge} from 'elkjs/lib/elk-api';
import {RecursivePartial} from '@gravity-ui/graph/build/utils/types/helpers';
import {TGraphColors} from '@gravity-ui/graph/build/graphConfig';

export const getGraphColors = (): RecursivePartial<TGraphColors> => {
    return {
        connection: {
            background: getColor('--yql-graph-color-edge'),
            selectedBackground: getColor('--yql-graph-color-edge-highlight'),
        },
        block: {
            background: getColor('--g-color-base-generic-ultralight'),
            selectedBorder: getColor('--yql-graph-color-edge-highlight'),
            border: getColor('--yql-graph-color-edge'),
            text: getColor('--yql-graph-color-text-label'),
        },
    };
};

export const config: HookGraphParams = {
    settings: {
        connection: MultipointConnection,
        canDuplicateBlocks: false,
        canCreateNewConnections: false,
        canZoomCamera: true,
        blockComponents: {
            block: NodeBlock,
        },
    },
    viewConfiguration: {
        colors: {
            ...getGraphColors(),
        },
    },
};

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
