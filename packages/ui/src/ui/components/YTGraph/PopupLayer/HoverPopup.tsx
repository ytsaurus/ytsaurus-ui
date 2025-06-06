import React, {MouseEvent, useRef} from 'react';
import cn from 'bem-cn-lite';

import {CanvasBlock, Graph, TBlock} from '@gravity-ui/graph';
import {Popup} from '@gravity-ui/uikit';

import {useHoverBlock} from '../hooks/useHoverBlock';
import './HoverPopup.scss';

export type HoverPopupProps<B extends TBlock> = {
    graph: Graph;
    renderContent: (props: {data: B}) => React.ReactNode;
    isBlockNode: (node: unknown) => node is CanvasBlock<B>;
};

const commonClass = cn('yt-graph-popup');

export function HoverPopup<B extends TBlock>({
    graph,
    renderContent,
    isBlockNode,
}: HoverPopupProps<B>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const {block, handleClearTimeout} = useHoverBlock(graph, containerRef.current, isBlockNode);

    const stopPropagation = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    if (!block) return null;

    const {x, y, width, height} = block.getGeometry();
    const position = {
        top: `${y}px`,
        left: `${x}px`,
        height: `${height}px`,
        width: `${width}px`,
    };

    return (
        <>
            <div
                ref={containerRef}
                className={commonClass({visible: true})}
                style={position}
                onMouseLeave={stopPropagation}
                onMouseEnter={stopPropagation}
                onMouseMove={stopPropagation}
            />

            <Popup
                open
                key={`${x}-${y}`}
                anchorRef={containerRef}
                onMouseEnter={handleClearTimeout}
            >
                {renderContent({data: block.state})}
            </Popup>
        </>
    );
}
