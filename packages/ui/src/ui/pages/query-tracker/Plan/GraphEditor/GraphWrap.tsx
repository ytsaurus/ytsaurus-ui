import React, {FC, useEffect, useMemo, useState} from 'react';
import {Graph} from './Graph';
import {
    ECameraScaleLevel,
    GraphState,
    HookGraphParams,
    useGraph,
    useGraphEvent,
} from '@gravity-ui/graph';
import {Loader} from '@gravity-ui/uikit';
import {NodeBlock} from './canvas/NodeBlock';
import {ProcessedGraph} from '../utils';
import {PopupPortal} from './PopupLayer';
import {createBlocks} from './helpers/createBlocks';
import {useResultProgress} from '../PlanContext';
import {GraphBlockType} from './enums';
import {ELKConnection} from './connections/ELKConnection';
import {getCSSPropertyValue, getHEXColor} from '../styles';
import {calculatePositions} from './helpers/calculatePositions';

const getGraphConfig = (): HookGraphParams => {
    const getColor = (name: string) => {
        return getHEXColor(
            getCSSPropertyValue(`--yql-graph-color-${name}`, document.body ?? undefined),
        );
    };

    return {
        settings: {
            connection: ELKConnection,
            canDuplicateBlocks: false,
            canCreateNewConnections: false,
            canZoomCamera: true,
            blockComponents: {
                [GraphBlockType.Table]: NodeBlock,
                [GraphBlockType.Operation]: NodeBlock,
            },
        },
        viewConfiguration: {
            colors: {
                connection: {
                    background: getColor('edge'),
                    selectedBackground: getColor('edge-highlight'),
                },
                block: {
                    background: '#fff',
                    selectedBorder: getColor('edge-highlight'),
                    border: getColor('edge'),
                    text: getColor('text-label'),
                },
            },
        },
    };
};

const BLOCK_SIDE = 100;
const blockSize = {height: BLOCK_SIDE, width: BLOCK_SIDE};

type Props = {
    processedGraph: ProcessedGraph;
};

export const GraphWrap: FC<Props> = ({processedGraph}) => {
    const {graph, setEntities, start} = useGraph(getGraphConfig());
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState<ECameraScaleLevel>(ECameraScaleLevel.Schematic);
    const progress = useResultProgress();

    useGraphEvent(graph, 'camera-change', (data) => {
        const cameraScale = graph.cameraService.getCameraBlockScaleLevel(data.scale);
        setScale(
            cameraScale === ECameraScaleLevel.Detailed ? ECameraScaleLevel.Schematic : cameraScale,
        );
    });

    useGraphEvent(graph, 'state-change', ({state}) => {
        if (state === GraphState.ATTACHED) {
            start();
        }
    });

    const positions = useMemo(() => {
        return calculatePositions({
            graph: processedGraph,
            sizes: blockSize,
        });
    }, [processedGraph]);

    useEffect(() => {
        positions.then((data) => {
            createBlocks(processedGraph, progress, data, scale, blockSize).then(
                ({blocks, connections}) => {
                    setEntities({blocks, connections});
                    setLoading(false);
                },
            );
        });
    }, [graph, positions, processedGraph, progress, scale, setEntities]);

    useEffect(() => {
        graph.zoomTo('center', {padding: 200});
    }, [graph, loading]);

    if (loading) return <Loader />;

    return (
        <div>
            <Graph graphEditor={graph} />
            <PopupPortal graph={graph} />
        </div>
    );
};
