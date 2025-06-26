import React from 'react';

import {
    CanvasBlock,
    ECameraScaleLevel,
    Graph,
    GraphState,
    TBlock,
    TConnection,
} from '@gravity-ui/graph';

import {GraphCanvas, HookGraphParams, useGraph, useGraphEvent} from '@gravity-ui/graph/react';

import {useThemeValue} from '@gravity-ui/uikit';

import {PopupPortal} from './PopupLayer';
import {getGraphColors} from './config';
import cn from 'bem-cn-lite';
import './YTGraph.scss';
import {YTGraphGroupProps, useAutoGroups, useCustomGroups} from './hooks/useGroups';

const block = cn('yt-graph');

export type YTGraphProps<B extends TBlock, C extends TConnection> = {
    className?: string;

    data: YTGraphData<B, C>;
    setScale: (v: ECameraScaleLevel) => void;
    config: HookGraphParams;
    isBlock: (v: unknown) => v is CanvasBlock<B>;
    renderPopup?: ({data}: {data: B}) => React.ReactNode;
    renderBlock?: (props: RenderContentProps<B>) => React.ReactNode;
} & YTGraphGroupProps;

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
    'id' | 'is' | 'meta' | 'group'
> & {
    id: string;
    is: IS;
    meta: Meta;
    groupId?: string;
    backgroundTheme?: 'info' | 'warning' | 'success' | 'danger';
};

export function YTGraph<B extends YTGraphBlock<string, {}>, C extends TConnection>({
    config,
    isBlock,
    data,
    setScale,
    renderPopup,
    className,
    renderBlock,
    allowAutoGroups,
    customGroups,
}: YTGraphProps<B, C>) {
    const theme = useThemeValue();
    const {graph, setEntities, start} = useGraph(config);

    useAutoGroups({allowAutoGroups, graph});
    useCustomGroups({customGroups, graph});

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

    const [element, setElement] = React.useState<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!element) {
            return undefined;
        }
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(() => {
                graph.api.zoomToViewPort({padding: 100});
            }, 100);
        });
        resizeObserver.observe(element);
        return () => {
            resizeObserver.unobserve(element);
        };
    }, [element]);

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
                    className: block('render-block', {
                        selected: data.selected,
                        background: data.backgroundTheme,
                    }),
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
        <div ref={setElement} className={block(null, className)}>
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
