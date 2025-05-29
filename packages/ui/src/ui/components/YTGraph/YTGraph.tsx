import React from 'react';
import {
    CanvasBlock,
    ECameraScaleLevel,
    GraphCanvas,
    GraphState,
    HookGraphParams,
    TBlock,
    TConnection,
    useGraph,
    useGraphEvent,
} from '@gravity-ui/graph';
import {useThemeValue} from '@gravity-ui/uikit';
import {PopupPortal} from './PopupLayer';
import {getGraphColors} from './config';
import cn from 'bem-cn-lite';
import './YTGraph.scss';

const block = cn('yt-graph');

export type YTGraphProps<B extends TBlock, C extends TConnection> = {
    data: {blocks: Array<B>; connections: Array<C>};
    setScale: (v: ECameraScaleLevel) => void;
    config: HookGraphParams;
    isBlock: (v: unknown) => v is CanvasBlock<B>;
    renderPopup: ({data}: {data: B}) => React.ReactNode;
};

export function YTGraph<B extends TBlock, C extends TConnection>(props: YTGraphProps<B, C>) {
    const {config, isBlock, data, setScale, renderPopup} = props;

    const theme = useThemeValue();
    const {graph, setEntities, start} = useGraph(config);

    React.useEffect(() => {
        setEntities(data);
    }, [data, setEntities]);

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

    React.useEffect(() => {
        graph.api.zoomToViewPort({padding: 100});
    }, [graph]);

    React.useEffect(() => {
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

    React.useEffect(() => {
        graph.setColors(getGraphColors());
    }, [graph, theme]);

    return (
        <div className={block()}>
            <GraphCanvas
                graph={graph}
                renderBlock={() => {
                    return <></>;
                }}
                className={block('graph')}
            />
            <PopupPortal graph={graph} renderContent={renderPopup} isBlockNode={isBlock} />
        </div>
    );
}
