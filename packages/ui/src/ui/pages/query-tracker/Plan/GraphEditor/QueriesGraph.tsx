import React, {FC, useEffect, useMemo, useState} from 'react';
import {
    ECameraScaleLevel,
    GraphCanvas,
    GraphState,
    useElk,
    useGraph,
    useGraphEvent,
} from '@gravity-ui/graph';
import {Loader, useThemeValue} from '@gravity-ui/uikit';
import {ProcessedGraph} from '../utils';
import {PopupPortal} from './PopupLayer';
import {createBlocks} from './helpers/createBlocks';
import {useResultProgress} from '../PlanContext';
import {config, getElkConfig, getGraphColors} from './config';
import {getNodesAndAges} from './helpers/getNodesAndAges';
import {NodeBlock} from './canvas/NodeBlock';
import {selectConnectionsByBlockId} from '@gravity-ui/graph/build/store/connection/selectors';
import cn from 'bem-cn-lite';
import './QueriesGraph.scss';

const BLOCK_SIDE = 100;

const blockSize = {height: BLOCK_SIDE, width: BLOCK_SIDE};

const b = cn('yt-queries-graph');

type Props = {
    processedGraph: ProcessedGraph;
};

const Graph: FC<Props> = ({processedGraph}) => {
    const theme = useThemeValue();
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
        graph.api.zoomToViewPort({padding: 100});
    }, [graph, loading]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(() => {
                graph.api.zoomToViewPort({padding: 100});
            }, 100);
        });

        const graphHtml = graph.getGraphHTML();
        resizeObserver.observe(graphHtml);

        return () => {
            resizeObserver.unobserve(graphHtml);
        };
    }, [graph]);

    useEffect(() => {
        graph.setColors(getGraphColors());
    }, [graph, theme]);

    if (loading) return <Loader />;

    return (
        <div>
            <GraphCanvas
                graph={graph}
                renderBlock={() => {
                    return <></>;
                }}
                className={b()}
            />
            <PopupPortal graph={graph} />
        </div>
    );
};

export default Graph;
