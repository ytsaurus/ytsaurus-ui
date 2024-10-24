import {ProcessedGraph} from '../../utils';
import ELK, {ElkNode} from 'elkjs';
import {GraphSize} from './getScaledSizes';

export const calculatePositions = async ({
    graph,
    sizes,
}: {
    graph: ProcessedGraph;
    sizes: GraphSize;
}) => {
    const offset = sizes.block.height.toString();
    const elk = new ELK();
    const data = await elk.layout(
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
                'spacing.nodeNode': offset, // Horizontal distance between nodes
                'spacing.nodeNodeBetweenLayers': offset, // Distance between layers (columns)
                'spacing.edgeNode': offset, // Distance between nodes and edges
                'spacing.edgeEdge': offset, // Distance between edges
                'spacing.edgeEdgeBetweenLayers': '0', // Distance between edges in layers
                'nodePlacement.strategy': 'SIMPLE', // Node placement strategy
                'elk.layered.layering.strategy': 'INTERACTIVE', // Interactive level management
                'elk.layered.crossingMinimization.semiInteractive': 'true', // Minimizing edge intersections
                'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED', // Align nodes within levels
                'elk.layered.thoroughness': '100',
            },
        },
        {},
    );

    return data.children?.reduce<Record<string, ElkNode>>((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});
};
