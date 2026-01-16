import {DEFAULT_NODE_WIDTH, Edge} from '../../services/layout';
import {MultipointConnection} from '../types';
import {TPoint} from '@gravity-ui/graph';

export const buildConnectionsFromEdges = (
    edges: Edge<string>[],
    nodePositions: Map<string, TPoint>,
    dotNodeIds: Set<string>,
    blockSizes: Map<string, {width: number; height: number}>,
    virtualNodeSize?: number,
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

    const getBlockRightEdge = (id: string): TPoint | undefined => {
        const pos = nodePositions.get(id);
        if (!pos) return undefined;

        const size = blockSizes.get(id);
        if (size) {
            return {
                x: pos.x + size.width,
                y: pos.y + size.height / 2,
            };
        }
        return pos;
    };

    const getBlockLeftEdge = (id: string): TPoint | undefined => {
        const pos = nodePositions.get(id);
        if (!pos) return undefined;

        const size = blockSizes.get(id);
        if (size) {
            return {
                x: pos.x,
                y: pos.y + size.height / 2,
            };
        }
        return pos;
    };

    const getVirtualNodeCenter = (id: string): TPoint | undefined => {
        const pos = nodePositions.get(id);
        if (!pos) return undefined;

        return {
            x: pos.x + (virtualNodeSize || DEFAULT_NODE_WIDTH) / 2,
            y: pos.y + (virtualNodeSize || DEFAULT_NODE_WIDTH) / 2,
        };
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

        const points: TPoint[] = [];
        const sourceEdge = getBlockRightEdge(sourceId);
        if (sourceEdge) {
            points.push(sourceEdge);
        }

        if (hasIntermediatePoints) {
            for (let i = 1; i < chain.length - 1; i++) {
                const center = getVirtualNodeCenter(chain[i]);
                if (center) {
                    points.push(center);
                }
            }
        }

        const targetEdge = getBlockLeftEdge(targetId);
        if (targetEdge) {
            points.push(targetEdge);
        }

        if (points.length >= 2) {
            connection.points = points;
        }

        connections.push(connection);
    }

    return connections;
};
