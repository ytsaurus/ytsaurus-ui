import {useEffect, useMemo, useState} from 'react';
import {ProcessedGraph} from '../../utils';
import {ECameraScaleLevel, TPoint} from '@gravity-ui/graph';
import {QueriesNodeBlock} from '../QueriesNodeBlock';
import {BLOCK_SIDE, createBlocks} from './createBlocks';
import {Node, layoutGraph} from '../../services/layout';
import {buildConnectionsFromEdges} from './buildConnectionsFromEdges';
import {toaster} from '../../../../../utils/toaster';
import {MultipointConnection} from '../types';
import {useSelector} from '../../../../../store/redux-hooks';
import {getQuerySingleProgress} from '../../../../../store/selectors/query-tracker/query';

export const useQueriesGraphLayout = (
    progressGraph: ProcessedGraph,
    scale: ECameraScaleLevel,
): {
    data: {blocks: QueriesNodeBlock[]; connections: MultipointConnection[]};
    isLoading: boolean;
} => {
    const {yql_progress: progress} = useSelector(getQuerySingleProgress);

    const {blocks, connections: initialConnections} = useMemo(
        () => createBlocks(progressGraph, progress, scale),
        [progressGraph, progress, scale],
    );

    const [positionedBlocks, setPositionedBlocks] = useState<QueriesNodeBlock[]>(blocks);
    const [connections, setConnections] = useState<MultipointConnection[]>(initialConnections);
    const [isLoading, setIsLoading] = useState(true);

    const layoutNodes = useMemo(
        () =>
            blocks.map((block) => ({
                id: block.id,
                level: (block as {level?: number}).level ?? 0,
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
            })),
        [blocks],
    );

    const layoutEdges = useMemo(
        () =>
            initialConnections.map((conn) => ({
                from: conn.sourceBlockId as string,
                to: conn.targetBlockId as string,
            })),
        [initialConnections],
    );

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        layoutGraph<string, Node<string> & {shape?: string}>({
            nodes: layoutNodes,
            edges: layoutEdges,
        })
            .then((layoutResult) => {
                if (cancelled) return;

                const resultNodes = layoutResult.nodes;
                const resultEdges = layoutResult.edges;

                const nodePositions = new Map<string, TPoint>();
                const dotNodeIds = new Set<string>();

                for (const node of resultNodes) {
                    nodePositions.set(node.id, {x: node.x ?? 0, y: node.y ?? 0});
                    if (node.shape === 'dot') {
                        dotNodeIds.add(node.id);
                    }
                }

                const blockSizes = new Map<string, {width: number; height: number}>();
                for (const block of blocks) {
                    blockSizes.set(block.id, {width: block.width, height: block.height});
                }

                const newPositionedBlocks: QueriesNodeBlock[] = blocks.map((block) => {
                    const pos = nodePositions.get(block.id);
                    return {
                        ...block,
                        x: pos?.x ?? 0,
                        y: pos?.y ?? 0,
                    };
                });

                const newConnections = buildConnectionsFromEdges(
                    resultEdges,
                    nodePositions,
                    dotNodeIds,
                    blockSizes,
                    BLOCK_SIDE,
                );

                setPositionedBlocks(newPositionedBlocks);
                setConnections(newConnections);
                setIsLoading(false);
            })
            .catch((e) => {
                if (cancelled) return;
                toaster.add({
                    name: 'layout_graph',
                    title: 'Error in graph calculation',
                    content: (e as Error).message,
                    theme: 'danger',
                    autoHiding: 10000,
                });
                setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [layoutNodes, layoutEdges]);

    return {data: {blocks: positionedBlocks, connections}, isLoading};
};
