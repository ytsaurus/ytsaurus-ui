import React, {FC, useRef} from 'react';
import {JobLineEvent} from './renderer/JobLineRenderer';
import {Popup} from '@gravity-ui/uikit';
import './EventTimelineTooltip.scss';
import cn from 'bem-cn-lite';
import {EventTimelineTooltipContent} from './EventTimelineTooltipContent';

const block = cn('yt-event-timeline-tooltip');

type Props = {
    events: {
        jobId: string;
        events: JobLineEvent[];
        time: number;
        offset: {
            x: number;
            y: number;
        };
    };
};

export const EventTimelineTooltip: FC<Props> = ({events: {events, offset}}) => {
    const anchorRef = useRef<HTMLDivElement>(null);

    const event = events.find((i) => i.renderType === 'jobLine');

    if (!event) return null;

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
                <EventTimelineTooltipContent
                    events={event.parts}
                    jobId={event.jobId}
                    metaData={event.meta}
                />
            </Popup>
        </div>
    );
};
