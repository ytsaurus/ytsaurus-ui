import React, {FC, useState} from 'react';

import {ECameraScaleLevel} from '@gravity-ui/graph';
import {Loader} from '@gravity-ui/uikit';

import {YTGraph, useConfig, useGraphScale} from '../../../../components/YTGraph';

import {ProcessedGraph} from '../utils';
import {useResultProgress} from '../PlanContext';
import {layoutGraph} from '../services/layout';
import {createBlocks} from './helpers/createBlocks';
import {QueriesCanvasBlock, QueriesNodeBlock} from './QueriesNodeBlock';
import {DetailBlock} from './DetailBlock';

type Props = {
    processedGraph: ProcessedGraph;
};

const Graph: FC<Props> = ({processedGraph}) => {
    const {scale, setScale} = useGraphScale();
    const {config, isBlock} = useConfig<QueriesNodeBlock>({
        block: QueriesCanvasBlock,
    });

    const [loading, setLoading] = useState(true);

    const {data, isLoading} = useQueriesGraphData(processedGraph, scale);

    React.useEffect(() => {
        if (!isLoading) {
            setLoading(false);
        }
    }, [isLoading]);

    return loading ? (
        <Loader />
    ) : (
        <YTGraph
            isBlock={isBlock}
            config={config}
            setScale={setScale}
            renderPopup={renderPopup}
            data={data}
        />
    );
};

function useQueriesGraphData(progressGraph: ProcessedGraph, scale: ECameraScaleLevel) {
    const progress = useResultProgress();

    const blocksData = React.useMemo(() => {
        return createBlocks(progressGraph, progress, scale);
    }, [progressGraph, scale, progress]);

    const [layoutResult, setLayoutResult] = useState<{
        data: typeof blocksData;
        isLoading: boolean;
    }>({data: {blocks: [], connections: []}, isLoading: true});

    React.useEffect(() => {
        let cancelled = false;

        async function computeLayout() {
            const {blocks, connections} = blocksData;

            // Convert blocks to nodes format for layoutGraph
            const nodes = blocks.map((block) => ({
                id: block.id,
                level: (block as {level?: number}).level ?? 0,
            }));

            // Convert connections to edges format for layoutGraph
            const edges = connections.map((conn) => ({
                from: conn.sourceBlockId as string,
                to: conn.targetBlockId as string,
            }));

            try {
                const {nodes: layoutedNodes, edges: layoutedEdges} = await layoutGraph({
                    nodes,
                    edges,
                });

                if (cancelled) return;

                // Create a set of real block ids
                const blockIds = new Set(blocks.map((b) => b.id));

                // Create a map of positions by node id (includes virtual nodes)
                const positionsMap = new Map(
                    layoutedNodes.map((node) => [
                        node.id,
                        {x: (node as {x?: number}).x ?? 0, y: (node as {y?: number}).y ?? 0},
                    ]),
                );

                // Apply positions to blocks
                const layoutedBlocks = blocks.map((block) => {
                    const pos = positionsMap.get(block.id);
                    return {
                        ...block,
                        x: pos?.x ?? 0,
                        y: pos?.y ?? 0,
                    };
                });

                // Build adjacency map for traversing edges through virtual nodes
                const adjacencyMap = new Map<
                    string,
                    {to: string; edge: (typeof layoutedEdges)[0]}[]
                >();
                for (const edge of layoutedEdges) {
                    const list = adjacencyMap.get(edge.from) ?? [];
                    list.push({to: edge.to, edge});
                    adjacencyMap.set(edge.from, list);
                }

                // Build connections with waypoints through virtual nodes
                const layoutedConnections: Array<{
                    id: string;
                    sourceBlockId: string;
                    targetBlockId: string;
                    points?: Array<{x: number; y: number}>;
                }> = [];

                // For each edge starting from a real node, trace path to next real node
                for (const edge of layoutedEdges) {
                    // Only process edges that start from real nodes
                    if (!blockIds.has(edge.from)) continue;

                    // Get source block position
                    const sourcePos = positionsMap.get(edge.from);
                    if (!sourcePos) continue;

                    // Trace path through virtual nodes to find target real node
                    const bendPoints: Array<{x: number; y: number}> = [];
                    let current = edge.to;

                    while (!blockIds.has(current)) {
                        // Current is a virtual node - add its position as bend point
                        const pos = positionsMap.get(current);
                        if (pos) {
                            bendPoints.push({x: pos.x, y: pos.y});
                        }

                        // Move to next node
                        const next = adjacencyMap.get(current)?.[0];
                        if (!next) break;
                        current = next.to;
                    }

                    // Now 'current' is the target real node
                    if (blockIds.has(current)) {
                        const targetPos = positionsMap.get(current);
                        if (!targetPos) continue;

                        // Build full path: startPoint + bendPoints + endPoint
                        const points = [
                            {x: sourcePos.x, y: sourcePos.y},
                            ...bendPoints,
                            {x: targetPos.x, y: targetPos.y},
                        ];

                        layoutedConnections.push({
                            id: `${edge.from}/${current}`,
                            sourceBlockId: edge.from,
                            targetBlockId: current,
                            points,
                        });
                    }
                }

                setLayoutResult({
                    data: {blocks: layoutedBlocks, connections: layoutedConnections},
                    isLoading: false,
                });
            } catch (error) {
                console.error('Layout computation failed:', error);
                if (!cancelled) {
                    setLayoutResult({data: blocksData, isLoading: false});
                }
            }
        }

        setLayoutResult((prev) => ({...prev, isLoading: true}));
        computeLayout();

        return () => {
            cancelled = true;
        };
    }, [blocksData]);

    return layoutResult;
}

function renderPopup(props: {data: QueriesNodeBlock}) {
    return <DetailBlock {...props} />;
}

export default Graph;
