import React, {FC, MouseEvent, useRef} from 'react';
import {Graph} from '@gravity-ui/graph';
import {Popup} from '@gravity-ui/uikit';
import {useHoverBlock} from '../hooks/useHoverBlock';
import './Popup.scss';
import './HoverPopup.scss';
import cn from 'bem-cn-lite';
import {DetailBlock} from '../DetailBlock';

type Props = {
    graph: Graph;
};

const commonClass = cn('yt-graph-popup');

export const HoverPopup: FC<Props> = ({graph}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const {block, handleClearTimeout} = useHoverBlock(graph, containerRef.current);

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
                className={commonClass({visible: true}, 'yt-graph-hover-popup')}
                style={position}
                onMouseLeave={stopPropagation}
                onMouseEnter={stopPropagation}
                onMouseMove={stopPropagation}
                onClick={stopPropagation}
            />

            <Popup
                open
                key={`${x}-${y}`}
                anchorRef={containerRef}
                onMouseEnter={handleClearTimeout}
            >
                <DetailBlock graph={graph} block={block} />
            </Popup>
        </>
    );
};
