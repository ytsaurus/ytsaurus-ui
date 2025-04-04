import React, {FC, useRef} from 'react';
import {JobLineEvent} from './renderer/JobLineRenderer';
import {Popup} from '@gravity-ui/uikit';
import './EventTimelineTooltip.scss';
import cn from 'bem-cn-lite';
import {EventTimelineTooltipContent} from './EventTimelineTooltipContent';

const block = cn('yt-event-timeline-tooltip');

type Props = {
    event: {
        jobId: string;
        event: JobLineEvent;
        time: number;
        offset: {
            x: number;
            y: number;
        };
    };
};

export const EventTimelineTooltip: FC<Props> = ({event: {event, offset}}) => {
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
            <Popup key={event.axisId} anchorRef={anchorRef} open disablePortal>
                <EventTimelineTooltipContent events={event.parts} jobId={event.jobId} />
            </Popup>
        </div>
    );
};
