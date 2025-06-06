import React from 'react';
import {
    CanvasBlock,
    ECameraScaleLevel,
    Graph,
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
    className?: string;

    data: YTGraphData<B, C>;
    setScale: (v: ECameraScaleLevel) => void;
    config: HookGraphParams;
    isBlock: (v: unknown) => v is CanvasBlock<B>;
    renderPopup?: ({data}: {data: B}) => React.ReactNode;
    renderBlock?: (props: RenderContentProps<B>) => React.ReactNode;
};

export type RenderContentProps<B extends TBlock> = {
    graph: Graph;
    data: B;
    className: string;
    style: React.CSSProperties;
};

export type YTGraphData<B extends TBlock, C extends TConnection> = {
    blocks: Array<B>;
    connections: Array<C>;
};

export type YTGraphBlock<IS, Meta extends Record<string, unknown>> = Omit<
    TBlock<Meta>,
    'is' | 'meta'
> & {
    is: IS;
    meta: Meta;
};

export function YTGraph<B extends TBlock, C extends TConnection>({
    config,
    isBlock,
    data,
    setScale,
    renderPopup,
    className,
    renderBlock,
}: YTGraphProps<B, C>) {
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

    const renderBlockCallback = React.useCallback(
        (graph: Graph, data: B) => {
            return !renderBlock ? (
                <></>
            ) : (
                renderBlock({
                    graph,
                    data,
                    className: block('render-block', {selected: data.selected}),
                    style: {
                        left: data.x,
                        top: data.y,
                        width: data.width,
                        height: data.height,
                        overflow: 'hidden',
                        position: 'absolute',
                    },
                })
            );
        },
        [renderBlock],
    );

    return (
        <div className={block(null, className)}>
            <GraphCanvas
                graph={graph}
                renderBlock={renderBlockCallback as any}
                className={block('graph')}
            />
            {renderPopup !== undefined && (
                <PopupPortal graph={graph} renderContent={renderPopup} isBlockNode={isBlock} />
            )}
        </div>
    );
}
