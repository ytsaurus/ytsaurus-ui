import {DEFAULT_NODE_WIDTH, Edge} from '../../services/layout';
import {MultipointConnection} from '../types';
import {TPoint} from '@gravity-ui/graph';

export const buildConnectionsFromEdges = (
    edges: Edge<string>[],
    nodePositions: Map<string, TPoint>,
    dotNodeIds: Set<string>,
    blockSizes: Map<string, {width: number; height: number}>,
): MultipointConnection[] => {
    // Build adjacency map: from -> [{to, arrows}]
    const adjacency = new Map<string, Array<{to: string; arrows?: Edge<string>['arrows']}>>();
    for (const edge of edges) {
        const neighbors = adjacency.get(edge.from);
        if (neighbors) {
            neighbors.push({to: edge.to, arrows: edge.arrows});
        } else {
            adjacency.set(edge.from, [{to: edge.to, arrows: edge.arrows}]);
        }
    }

    const connections: MultipointConnection[] = [];
    const visitedEdges = new Set<string>();

    const getBlockCenter = (id: string): TPoint | undefined => {
        const pos = nodePositions.get(id);
        if (!pos) return undefined;

        const size = blockSizes.get(id);
        if (size) {
            return {
                x: pos.x + size.width / 2,
                y: pos.y + size.height / 2,
            };
        }
        return pos;
    };

    // Find chains starting from non-dot nodes
    for (const edge of edges) {
        const edgeKey = `${edge.from}->${edge.to}`;
        if (visitedEdges.has(edgeKey)) continue;

        // Skip edges that start from dot nodes (they are part of another chain)
        if (dotNodeIds.has(edge.from)) continue;

        // Trace the chain from this edge
        const chain: string[] = [edge.from];
        let current = edge.to;
        visitedEdges.add(edgeKey);

        // Follow through dot nodes
        while (dotNodeIds.has(current)) {
            chain.push(current);
            const nextEdges = adjacency.get(current);
            if (!nextEdges || nextEdges.length === 0) break;

            // Dot nodes should have exactly one outgoing edge in a chain
            const nextEdge = nextEdges[0];
            const nextEdgeKey = `${current}->${nextEdge.to}`;
            visitedEdges.add(nextEdgeKey);
            current = nextEdge.to;
        }
        chain.push(current);

        // Build connection with intermediate points
        const sourceId = chain[0];
        const targetId = chain[chain.length - 1];

        // Check if there are intermediate dot nodes
        const hasIntermediatePoints = chain.length > 2;

        const connectionId = `${sourceId}/${targetId}/${connections.length}`;
        const connection: MultipointConnection = {
            id: connectionId,
            sourceBlockId: sourceId,
            targetBlockId: targetId,
        };

        // If there are intermediate points, build full points array
        // points must include: source center, all intermediate points, target center
        if (hasIntermediatePoints) {
            const points: TPoint[] = [];

            // Add source block center
            const sourceCenter = getBlockCenter(sourceId);
            if (sourceCenter) {
                points.push(sourceCenter);
            }

            // Add intermediate points (dot nodes)
            // Treat virtual nodes as if they have DEFAULT_NODE_WIDTH size and take their center
            for (let i = 1; i < chain.length - 1; i++) {
                const pos = nodePositions.get(chain[i]);
                if (pos) {
                    points.push({
                        x: pos.x + DEFAULT_NODE_WIDTH / 2,
                        y: pos.y + DEFAULT_NODE_WIDTH / 2,
                    });
                }
            }

            // Add target block center
            const targetCenter = getBlockCenter(targetId);
            if (targetCenter) {
                points.push(targetCenter);
            }

            // Only set points if we have at least 2 points
            if (points.length >= 2) {
                connection.points = points;
            }
        }

        connections.push(connection);
    }

    return connections;
};
