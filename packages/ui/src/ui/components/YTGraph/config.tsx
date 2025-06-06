import React from 'react';

import ELK, {ElkExtendedEdge} from 'elkjs';
import {
    CanvasBlock,
    ECameraScaleLevel,
    HookGraphParams,
    MultipointConnection,
    TBlock,
    TConnection,
    useElk,
} from '@gravity-ui/graph';
import {RecursivePartial} from '@gravity-ui/graph/build/utils/types/helpers';
import {TGraphColors} from '@gravity-ui/graph/build/graphConfig';

import {getCssColor} from '../../utils/get-css-color';
import {useMemoizedIfEqual} from '../../hooks/use-updater';
import {YTGraphData} from './YTGraph';

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

const DEFAULT_BLOCK_SIZE = 100;

export function useConfig<T extends TBlock>(
    blockComponents: Record<T['is'], typeof CanvasBlock<T>>,
): {
    config: HookGraphParams;
    isBlock: (v: unknown) => v is CanvasBlock<T>;
    scale: ECameraScaleLevel;
    setScale: (v: ECameraScaleLevel) => void;
} {
    const [scale, setScale] = React.useState<ECameraScaleLevel>(ECameraScaleLevel.Schematic);
    const [blockComponentsCached] = useMemoizedIfEqual(blockComponents);

    const config = React.useMemo(() => {
        const config = {
            settings: {
                connection: MultipointConnection,
                canDuplicateBlocks: false,
                canCreateNewConnections: false,
                canZoomCamera: true,
                blockComponents,
            },
            viewConfiguration: {
                colors: {
                    ...getGraphColors(),
                },
            },
        };
        const knownTypes = new Set(Object.keys(blockComponentsCached));
        return {
            config,
            isBlock: (v: unknown): v is CanvasBlock<T> => {
                return knownTypes.has((v as Partial<CanvasBlock<T>>).state?.is!);
            },
        };
    }, [blockComponentsCached]);

    return {...config, scale, setScale};
}

const getElkConfig = (
    children: {id: string; level?: number; width?: number; height?: number}[],
    edges: ElkExtendedEdge[],
    defaultSize: {height: number; width: number} = {
        width: DEFAULT_BLOCK_SIZE,
        height: DEFAULT_BLOCK_SIZE,
    },
) => {
    return {
        id: 'root',
        children: children.map((node) => ({
            id: node.id,
            width: node.width ?? defaultSize.width,
            height: node.height ?? defaultSize.height,
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
            'spacing.nodeNode': String(DEFAULT_BLOCK_SIZE), // Node horizontal spacing
            'spacing.nodeNodeBetweenLayers': Math.round(defaultSize.height / 2).toString(), // Layer spacing
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

export function useElkLayout<B extends TBlock, C extends TConnection>({
    blocks,
    connections,
}: YTGraphData<B, C>): {data: YTGraphData<B, C>; isLoading: boolean} {
    const elkConfig = React.useMemo(() => {
        const children = blocks.map(({id, width, height}) => ({
            id: String(id),
            width,
            height,
        }));
        const edges = connections.map((item) => ({
            id: connectionId(item),
            sources: [item.sourceBlockId as string],
            targets: [item.targetBlockId as string],
        }));

        return getElkConfig(children, edges);
    }, [blocks, connections]);

    const elk = React.useMemo(() => {
        return new ELK();
    }, []);

    const [positions] = useMemoizedIfEqual(useElk(elkConfig, elk));

    const res = React.useMemo(() => {
        const {result, isLoading} = positions;

        if (positions.isLoading || !result || Object.keys(result.blocks).length === 0) {
            return {isLoading, data: {blocks: [], connections: []}};
        }

        return {
            isLoading,
            data: {
                blocks: blocks.map((item) => {
                    return {...item, ...result?.blocks?.[item.id]};
                }),
                connections: connections.map((item) => {
                    return {...item, ...result?.edges?.[connectionId(item)]};
                }),
            },
        };
    }, [blocks, connections, positions]);
    return res;
}

function connectionId(item: TConnection) {
    return item.id !== undefined
        ? String(item.id)
        : `${String(item.sourceBlockId)}:${String(item.targetBlockId)}`;
}
