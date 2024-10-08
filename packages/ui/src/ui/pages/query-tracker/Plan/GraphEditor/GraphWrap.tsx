import React, {FC, useEffect, useMemo, useState} from 'react';
import {Graph} from './Graph';
import {ECameraScaleLevel, GraphState, useGraph, useGraphEvent} from '@gravity-ui/graph';
import {Loader} from '@gravity-ui/uikit';
import {ProcessedGraph} from '../utils';
import {PopupPortal} from './PopupLayer';
import {createBlocks} from './helpers/createBlocks';
import {useResultProgress} from '../PlanContext';
import {config, getElkConfig} from './config';
import {getNodesAndAges} from './helpers/getNodesAndAges';
import {useElk} from './hooks/useElk';
import {NodeBlock} from './canvas/NodeBlock';
import {selectConnectionsByBlockId} from '@gravity-ui/graph/build/store/connection/selectors';
import {zoomGraphToCenter} from './helpers/zoomGraphToCenter';

const BLOCK_SIDE = 100;
const blockSize = {height: BLOCK_SIDE, width: BLOCK_SIDE};

type Props = {
    processedGraph: ProcessedGraph;
};

export const GraphWrap: FC<Props> = ({processedGraph}) => {
    const {graph, setEntities, start} = useGraph(config);
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

    useGraphEvent(graph, 'click', (_, event) => {
        if (event.detail.target instanceof NodeBlock) {
            const edges = selectConnectionsByBlockId(graph, event.detail.target.state.id);
            if (!edges.length) return;
            const ids = edges.map((edge) => edge.id);
            graph.rootStore.connectionsList.setConnectionsSelection(ids, true);
        } else {
            graph.rootStore.connectionsList.resetSelection();
        }
    });

    const elkConfig = useMemo(() => {
        const {children, edges} = getNodesAndAges(processedGraph);
        return getElkConfig(children, edges, blockSize);
    }, [processedGraph]);

    const positions = useElk(elkConfig);

    useEffect(() => {
        if (positions.isLoading || !positions.result) return;

        createBlocks(processedGraph, progress, positions.result, scale, blockSize).then(
            ({blocks, connections}) => {
                setEntities({blocks, connections});
                setLoading(false);
            },
        );
    }, [graph, positions, processedGraph, progress, scale, setEntities]);

    useEffect(() => {
        zoomGraphToCenter(graph, {blockSide: BLOCK_SIDE, padding: 100});
    }, [graph, loading]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(() => {
                zoomGraphToCenter(graph, {blockSide: BLOCK_SIDE, padding: 100});
            }, 100);
        });

        const graphHtml = graph.getGraphHTML();
        resizeObserver.observe(graphHtml);

        return () => {
            resizeObserver.unobserve(graphHtml);
        };
    }, [graph]);

    if (loading) return <Loader />;

    return (
        <div>
            <Graph graphEditor={graph} />
            <PopupPortal graph={graph} />
        </div>
    );
};
