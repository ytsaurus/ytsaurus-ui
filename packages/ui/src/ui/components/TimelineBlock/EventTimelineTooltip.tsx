import React, {FC, PropsWithChildren, useRef} from 'react';
import {Popup} from '@gravity-ui/uikit';
import './EventTimelineTooltip.scss';
import cn from 'bem-cn-lite';

const block = cn('yt-event-timeline-tooltip');

type Props = {
    offset: {
        x: number;
        y: number;
    };
};

export const EventTimelineTooltip: FC<PropsWithChildren<Props>> = ({children, offset}) => {
    const anchorRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={block()}
            style={{
                top: offset.y,
                left: offset.x,
            }}
        >
            <div ref={anchorRef} className={block('anchor')} />
            <Popup anchorRef={anchorRef} open disablePortal>
                {children}
            </Popup>
        </div>
    );
};
