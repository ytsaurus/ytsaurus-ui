import React, {FC, MouseEvent, useRef} from 'react';
import {useBlockGeometry} from '../hooks/useBlockGeometry';
import {useClickBlock} from '../hooks/useClickBlock';
import {Graph} from '@gravity-ui/graph';
import cn from 'bem-cn-lite';
import './Popup.scss';
import './ClickPopup.scss';
import {DetailBlock} from '../DetailBlock';
import {ScaleStep} from '../enums';

type Props = {
    graph: Graph;
};

const commonClass = cn('yt-graph-popup');
const block = cn('yt-graph-click-popup');

export const ClickPopup: FC<Props> = ({graph}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const clickedBlock = useClickBlock(graph);
    useBlockGeometry({
        container: containerRef.current,
        block: clickedBlock,
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
        block({detailed: clickedBlock?.state.meta.scale === ScaleStep.Detailed}),
    ].join(' ');

    return (
        <div ref={containerRef} className={className}>
            {clickedBlock && (
                <div onClick={stopPropagation}>
                    <DetailBlock block={clickedBlock.state} showHeader showInfo />
                </div>
            )}
        </div>
    );
};
