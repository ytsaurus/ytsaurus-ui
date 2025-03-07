import React, {FC, useRef} from 'react';
import {JobLineEvent} from '../../../../../packages/ya-timeline/components/Events/JobLineRenderer';
import {Popup} from '@gravity-ui/uikit';
import './EventTimelineTooltip.scss';
import cn from 'bem-cn-lite';
import {EventTimelineTooltipContent} from './EventTimelineTooltipContent';

const block = cn('yt-event-timeline-tooltip');

type Props = {
    event: {
        event: JobLineEvent;
        time: number;
        offset: {
            x: number;
            y: number;
        };
    };
};

export const EventTimelineTooltip: FC<Props> = ({event: {event, time, offset}}) => {
    const anchorRef = useRef<HTMLDivElement>(null);

    const currentEvent = event.parts.find((e) => time >= e.interval.from && time <= e.interval.to);
    if (!currentEvent) return null;

    return (
        <div
            className={block()}
            style={{
                top: offset.y,
                left: offset.x,
            }}
        >
            <div ref={anchorRef} className={block('anchor')} />
            <Popup key={currentEvent.state} anchorRef={anchorRef} open disablePortal>
                <EventTimelineTooltipContent event={currentEvent} jobId={event.axisId} />
            </Popup>
        </div>
    );
};
