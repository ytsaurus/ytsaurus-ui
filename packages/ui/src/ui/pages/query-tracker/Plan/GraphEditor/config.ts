import {HookGraphParams} from '@gravity-ui/graph';
import {getColor} from './helpers/getColor';
import {ELKConnection} from './connections/ELKConnection';
import {NodeBlock} from './canvas/NodeBlock';
import {ElkExtendedEdge} from 'elkjs/lib/elk-api';

export const config: HookGraphParams = {
    settings: {
        connection: ELKConnection,
        canDuplicateBlocks: false,
        canCreateNewConnections: false,
        canZoomCamera: true,
        blockComponents: {
            block: NodeBlock,
        },
    },
    viewConfiguration: {
        colors: {
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
            'spacing.nodeNode': sizes.height.toString(), // Горизонтальное расстояние между узлами
            'spacing.nodeNodeBetweenLayers': Math.round(sizes.height / 2).toString(), // Уменьшите расстояние между слоями
            'spacing.edgeNode': '25', // Math.round(sizes.block.height / 2).toString(), // Расстояние между узлами и ребрами
            'spacing.edgeEdge': '25', // Расстояние между ребрами
            'spacing.edgeEdgeBetweenLayers': '35', // Уменьшите расстояние между ребрами в слоях
            'spacing.edgeNodeBetweenLayers': '25', // Расстояние между узлами и ребрами в слоях
            'nodePlacement.strategy': 'TIGHT_TREE', // Измените стратегию размещения узлов
            'elk.layered.nodePlacement.bk.fixedAlignment': 'CENTER', //'BALANCED', // Выравнивание узлов
            'elk.layered.crossingMinimization.strategy': 'LAYER_PER_LAYER_SWEEP',
            'elk.layered.thoroughness': '200', // Увеличьте уровень детализации
            'elk.portConstraints': 'FREE',
        },
    };
};
