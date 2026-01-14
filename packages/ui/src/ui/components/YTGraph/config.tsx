import React from 'react';

import ELK, {ElkExtendedEdge, ElkNode} from 'elkjs';
import {CanvasBlock, ECameraScaleLevel, TBlock, TConnection} from '@gravity-ui/graph';

import {HookGraphParams, MultipointConnection, useElk} from '@gravity-ui/graph/react';

import {RecursivePartial} from '@gravity-ui/graph/build/utils/types/helpers';
import {TGraphColors} from '@gravity-ui/graph/build/graphConfig';

import {getCssColor} from '../../utils/get-css-color';
import {useMemoizedIfEqual} from '../../hooks';
import {YTGraphBlock, YTGraphData} from './YTGraph';
import {NoopComponent} from './canvas/NoopComponent';

export const getGraphColors = (): RecursivePartial<TGraphColors> => {
    return {
        connection: {
            background: getCssColor('--yql-graph-color-edge'),
            selectedBackground: getCssColor('--yql-graph-color-edge-highlight'),
        },
        block: {
            background: getCssColor('--g-color-base-float'),
            selectedBorder: getCssColor('--yql-graph-color-edge-highlight'),
            border: getCssColor('--yql-graph-color-edge'),
            text: getCssColor('--yql-graph-color-text-label'),
        },
    };
};

export function useConfig<T extends TBlock>(
    blockComponents: Record<T['is'], typeof CanvasBlock<T>>,
    {
        useDefaultConnection,
        connection,
    }: {useDefaultConnection?: boolean; connection?: typeof MultipointConnection} = {},
): {
    config: HookGraphParams;
    isBlock: (v: unknown) => v is CanvasBlock<T>;
} {
    const [blockComponentsCached] = useMemoizedIfEqual(blockComponents);

    const config = React.useMemo(() => {
        const resolvedConnection = useDefaultConnection
            ? undefined
            : (connection ?? MultipointConnection);

        const config: HookGraphParams = {
            settings: {
                connection: resolvedConnection,
                canDuplicateBlocks: false,
                canCreateNewConnections: false,
                canZoomCamera: true,
                blockComponents,
                // @ts-expect-error
                background: NoopComponent,
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
    }, [blockComponentsCached, useDefaultConnection, connection]);

    return {...config};
}

export function useGraphScale() {
    const [scale, setScale] = React.useState<ECameraScaleLevel>(ECameraScaleLevel.Schematic);
    return {scale, setScale};
}

const LAYOUT_OPTIONS = {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'spacing.nodeNode': '100', // Node horizontal spacing
    'spacing.nodeNodeBetweenLayers': '50', // Layer spacing
    'spacing.edgeNode': '25', // Nodes and edges spacing
    'spacing.edgeEdge': '25', // Edges spacing
    'spacing.edgeEdgeBetweenLayers': '35', // Distance between edges in layers
    'spacing.edgeNodeBetweenLayers': '25', // Distance between nodes and edges in layers
    'nodePlacement.strategy': 'TIGHT_TREE', // Node placement strategy
    'elk.layered.nodePlacement.bk.fixedAlignment': 'CENTER', // Node alignment
    'elk.layered.crossingMinimization.strategy': 'LAYER_PER_LAYER_SWEEP',
    'elk.layered.thoroughness': '200', // Level of detail
    'elk.portConstraints': 'FREE',
};

function toElkNodes(children: Array<ElkNode & {level?: number}> = []) {
    return children.map((item): ElkNode => {
        return {
            id: item.id,
            ...(item.width !== undefined ? {width: item.width} : {}),
            ...(item.height !== undefined ? {height: item.height} : {}),
            layoutOptions: {
                ...LAYOUT_OPTIONS,
                'elk.direction': 'DOWN',
                ...(item.level === 1 ? {'elk.layered.layering.layerConstraint': '1'} : {}),
            },
            ...(item.children?.length! > 0 ? {children: toElkNodes(item.children)} : {}),
        };
    });
}

const getElkConfig = (children: Array<ElkNode & {level?: number}>, edges: ElkExtendedEdge[]) => {
    return {
        id: 'root',
        children: toElkNodes(children),
        edges,
        layoutOptions: LAYOUT_OPTIONS,
    };
};

export function useElkLayout<B extends YTGraphBlock<string, {}>, C extends TConnection>({
    blocks,
    connections,
}: YTGraphData<B, C>): {
    data: YTGraphData<B, C>;
    isLoading: boolean;
} {
    const elkParams = React.useMemo(() => {
        const edges = connections.map((item) => ({
            id: connectionId(item),
            sources: [item.sourceBlockId as string],
            targets: [item.targetBlockId as string],
        }));

        return {elkConfig: getElkConfig(blocks, edges)};
    }, [blocks, connections]);

    const elk = React.useMemo(() => {
        return new ELK();
    }, []);

    const [positions] = useMemoizedIfEqual(useElk(elkParams.elkConfig, elk));

    const res = React.useMemo(() => {
        const {result, isLoading} = positions;

        if (positions.isLoading || !result || Object.keys(result.blocks).length === 0) {
            return {isLoading, data: {blocks: [], connections: []}};
        }

        return {
            isLoading,
            data: {
                blocks: blocks.map((item) => {
                    return {...item, ...positions.result.blocks[item.id]} as B;
                }),
                connections: connections.map((item) => {
                    return {...item, ...result?.edges?.[connectionId(item)]};
                }),
            },
        };
    }, [blocks, positions]);
    return res;
}

function connectionId(item: TConnection) {
    return item.id !== undefined
        ? String(item.id)
        : `${String(item.sourceBlockId)}:${String(item.targetBlockId)}`;
}
