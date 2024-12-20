import React, {FC, MouseEvent, useRef} from 'react';
import {useClickBlock} from '../hooks/useClickBlock';
import {Graph} from '@gravity-ui/graph';
import cn from 'bem-cn-lite';
import './Popup.scss';
import './ClickPopup.scss';
import {DetailBlock} from '../DetailBlock';
import {usePopupPosition} from '../hooks/usePopupPosition';

type Props = {
    graph: Graph;
};

const commonClass = cn('yt-graph-popup');
const block = cn('yt-graph-click-popup');

export const ClickPopup: FC<Props> = ({graph}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const clickedBlock = useClickBlock(graph);

    const style = usePopupPosition({
        container: containerRef.current,
        block: clickedBlock,
        cameraState: graph.cameraService.getCameraState(),
        varName: '--yt-graph-popup-geometry',
    });

    const stopPropagation = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const className = [
        commonClass({
            visible: Boolean(clickedBlock),
        }),
        block(),
    ].join(' ');

    return (
        <div ref={containerRef} className={className} onClick={stopPropagation} style={style}>
            {clickedBlock && (
                <DetailBlock
                    graph={graph}
                    block={clickedBlock}
                    showHeader
                    showInfo
                    style={{maxHeight: style?.maxHeight}}
                />
            )}
        </div>
    );
};
