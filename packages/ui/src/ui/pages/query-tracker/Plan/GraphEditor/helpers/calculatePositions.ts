import {ProcessedGraph} from '../../utils';
import ELK from 'elkjs';

export const calculatePositions = async ({
    graph,
    sizes,
}: {
    graph: ProcessedGraph;
    sizes: {
        block: {height: number; width: number};
        layout: {vertical: number; horizontal: number};
    };
}) => {
    const offset = sizes.block.height.toString();
    const elk = new ELK();
    return await elk.layout(
        {
            id: 'root',
            children: graph.nodes.map((node) => ({
                id: node.id,
                width: sizes.block.width,
                height: sizes.block.height,
                ...(node.level === 1
                    ? {
                          layoutOptions: {
                              'elk.layered.layering.layerConstraint': '1',
                          },
                      }
                    : {}),
            })),
            edges: graph.edges.map((edge, i) => ({
                id: 'e' + i,
                sources: [edge.from],
                targets: [edge.to],
            })),
            layoutOptions: {
                'elk.algorithm': 'layered',
                'elk.direction': 'RIGHT',
                'spacing.nodeNode': offset, // Горизонтальное расстояние между узлами
                'spacing.nodeNodeBetweenLayers': Math.round(sizes.block.height / 2).toString(), // Уменьшите расстояние между слоями
                'spacing.edgeNode': '20', // Math.round(sizes.block.height / 2).toString(), // Расстояние между узлами и ребрами
                'spacing.edgeEdge': '20', // Расстояние между ребрами
                'spacing.edgeEdgeBetweenLayers': '30', // Уменьшите расстояние между ребрами в слоях
                'spacing.edgeNodeBetweenLayers': '20', // Расстояние между узлами и ребрами в слоях
                'nodePlacement.strategy': 'TIGHT_TREE', // Измените стратегию размещения узлов
                'elk.layered.nodePlacement.bk.fixedAlignment': 'CENTER', //'BALANCED', // Выравнивание узлов
                'elk.layered.crossingMinimization.strategy': 'LAYER_PER_LAYER_SWEEP',
                'elk.layered.thoroughness': '200', // Увеличьте уровень детализации
                'elk.portConstraints': 'FREE',
            },
        },
        {},
    );
};
