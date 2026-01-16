import React, {MouseEvent} from 'react';
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
    const [element, setElement] = React.useState<HTMLDivElement | null>(null);
    const {
        block: hoverBlock,
        handleClearTimeout,
        handleClosePopup,
    } = useHoverBlock(graph, element, isBlockNode);
    const [popupBlock, setPopupBlock] = React.useState<typeof hoverBlock>();

    const stopPropagation = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const block = hoverBlock ?? popupBlock;

    if (!block) return null;

    const {x, y, width, height} = block.getGeometry();
    const position = {
        top: `${y}px`,
        left: `${x}px`,
        height: `${height}px`,
        width: `${width}px`,
    };

    const content = renderContent({data: block.state});

    return !content ? null : (
        <>
            <div
                ref={setElement}
                className={commonClass({visible: true})}
                style={position}
                onMouseLeave={stopPropagation}
                onMouseEnter={stopPropagation}
                onMouseMove={stopPropagation}
            />

            <Popup open key={`${x}-${y}`} anchorElement={element} placement="bottom">
                <div
                    onMouseEnter={() => {
                        handleClearTimeout();
                        setPopupBlock(hoverBlock);
                    }}
                    onMouseLeave={() => {
                        setPopupBlock(undefined);
                        handleClosePopup();
                    }}
                >
                    {content}
                </div>
            </Popup>
        </>
    );
}
