import React, {FC, MouseEvent, useRef} from 'react';
import {Graph} from '@gravity-ui/graph';
import {useHoverBlock} from '../hooks/useHoverBlock';
import {useClickBlock} from '../hooks/useClickBlock';
import {useBlockGeometry} from '../hooks/useBlockGeometry';
import './Popup.scss';
import './HoverPopup.scss';
import cn from 'bem-cn-lite';
import {DetailBlock} from '../DetailBlock';
import {ScaleStep} from '../enums';

type Props = {
    graph: Graph;
};

const commonClass = cn('yt-graph-popup');

export const HoverPopup: FC<Props> = ({graph}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const clickedBlock = useClickBlock(graph);
    const hoveredBlock = useHoverBlock(graph, containerRef.current);

    useBlockGeometry({
        container: containerRef.current,
        block: hoveredBlock,
        varName: '--yt-graph--hover-popup-geometry',
    });

    const stopPropagation = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const isDetailed = hoveredBlock?.state.meta.scale === ScaleStep.Detailed;
    const visible = hoveredBlock && hoveredBlock.state.id !== clickedBlock?.state.id;
    return (
        <div ref={containerRef} className={commonClass({visible}, 'yt-graph-hover-popup')}>
            {hoveredBlock && (
                <div
                    onMouseLeave={stopPropagation}
                    onMouseEnter={stopPropagation}
                    onMouseMove={stopPropagation}
                    onClick={stopPropagation}
                >
                    <DetailBlock block={hoveredBlock.state} showHeader={!isDetailed} showInfo />
                </div>
            )}
        </div>
    );
};
