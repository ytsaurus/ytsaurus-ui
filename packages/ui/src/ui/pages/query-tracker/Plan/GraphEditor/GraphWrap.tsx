import React, {FC, useCallback, useEffect, useState} from 'react';
import {Graph} from './Graph';
import {Graph as GraphEditor} from '@gravity-ui/graph';
import {NodeBlock} from './canvas/NodeBlock';
import {ZoomLayer} from './ZoomLayer';
import {ProcessedGraph} from '../utils';
import {TCameraState} from '@gravity-ui/graph/build/services/camera/CameraService';
import {PopupPortal} from './PopupLayer';
import {createBlocks} from './helpers/createBlocks';
import {useResultProgress} from '../PlanContext';
import type {Progress} from '../models/plan';
import {GraphBlockType, ScaleStep} from './enums';

const graphEditor = new GraphEditor(
    {
        configurationName: 'yt',
        blocks: [],
        settings: {
            canDuplicateBlocks: false,
            canCreateNewConnections: false,
            canZoomCamera: false,
            blockComponents: {
                [GraphBlockType.Table]: NodeBlock,
                [GraphBlockType.Operation]: NodeBlock,
            },
        },
        layers: [[ZoomLayer, {}]],
        connections: [],
    },
    undefined,
    {
        connection: {
            background: '#00000026',
            selectedBackground: '#5282FF',
        },
        block: {
            background: '#fff',
            selectedBorder: '#f2f2f2',
            border: '#00000026',
            text: '#000',
        },
    },
);

const drawGraph = async (graph: ProcessedGraph, progress: Progress | null, scale: ScaleStep) => {
    const blocks = await createBlocks(graph, progress, scale);
    graphEditor.rootStore.blocksList.setBlocks(blocks);
    graphEditor.rootStore.connectionsList.setConnections(
        graph.edges.map((i) => {
            return {
                sourceBlockId: i.from,
                targetBlockId: i.to,
            };
        }),
    );

    // camera to center
    const rect = graphEditor.rootStore.blocksList.getUsableRect();
    const xyPosition = graphEditor.cameraService.getXYRelativeCenterDimensions(rect, scale);
    graphEditor.cameraService.set({...xyPosition, scale});
};

type Props = {
    graph: ProcessedGraph;
};

export const GraphWrap: FC<Props> = ({graph}) => {
    const [scale, setScale] = useState(ScaleStep.Schematic);
    const progress = useResultProgress();

    const handleCameraChange = useCallback((e: CustomEvent<TCameraState>) => {
        setScale(e.detail.scale);
    }, []);

    useEffect(() => {
        graphEditor.on('camera-change', handleCameraChange);
        return () => {
            graphEditor.off('camera-change', handleCameraChange);
        };
    }, [handleCameraChange]);

    useEffect(() => {
        drawGraph(graph, progress, scale);
    }, [graph, progress, scale]);

    return (
        <div>
            <Graph graphEditor={graphEditor} />
            <PopupPortal graph={graphEditor} />
        </div>
    );
};
