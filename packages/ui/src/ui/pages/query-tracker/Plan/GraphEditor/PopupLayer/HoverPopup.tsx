import React, {FC, MouseEvent, useRef} from 'react';
import {Graph} from '@gravity-ui/graph';
import {useHoverBlock} from '../hooks/useHoverBlock';
import {useClickBlock} from '../hooks/useClickBlock';
import './Popup.scss';
import './HoverPopup.scss';
import cn from 'bem-cn-lite';
import {DetailBlock} from '../DetailBlock';
import {usePopupPosition} from '../hooks/usePopupPosition';

type Props = {
    graph: Graph;
};

const commonClass = cn('yt-graph-popup');

export const HoverPopup: FC<Props> = ({graph}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const clickedBlock = useClickBlock(graph);
    const hoveredBlock = useHoverBlock(graph, containerRef.current);

    const stopPropagation = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const style = usePopupPosition({
        container: containerRef.current,
        block: hoveredBlock,
        cameraState: graph.cameraService.getCameraState(),
        varName: '--yt-graph--hover-popup-geometry',
    });

    const visible = hoveredBlock && hoveredBlock.state.id !== clickedBlock?.state.id;
    return (
        <div
            ref={containerRef}
            className={commonClass({visible}, 'yt-graph-hover-popup')}
            onMouseLeave={stopPropagation}
            onMouseEnter={stopPropagation}
            onMouseMove={stopPropagation}
            onClick={stopPropagation}
            style={style}
        >
            {hoveredBlock && (
                <DetailBlock
                    graph={graph}
                    block={hoveredBlock}
                    showHeader
                    showInfo
                    style={{maxHeight: style?.maxHeight}}
                />
            )}
        </div>
    );
};
