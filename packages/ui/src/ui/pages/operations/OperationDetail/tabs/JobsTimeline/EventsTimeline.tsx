import React, {FC, useMemo, useState} from 'react';
import {Timeline} from '../../../../query-tracker/Plan/Timeline/TimelineCanvas';
import {
    Interval,
    JobEvent,
} from '../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {
    EventsSelectedEvent,
    HoverEvent,
} from '../../../../../packages/ya-timeline/components/Events';
import './EventsTimeline.scss';
import cn from 'bem-cn-lite';
import {prepareJobTimeline} from './helpers/prepareJobTimeline';
import {JobLineEvent} from '../../../../../packages/ya-timeline/components/Events/JobLineRenderer';
import {EventTimelineTooltip} from './EventTimelineTooltip';
import {OFFSET, TIMELINE_HEIGHT} from './constants';

const block = cn('yt-events-timeline');

type Props = {
    events: Record<string, JobEvent[]>;
    interval: Interval;
};

export const EventsTimeline: FC<Props> = ({events, interval}) => {
    const [hEvent, setHEvent] = useState<HoverEvent<JobLineEvent>>();

    const {axes, timelines} = useMemo(() => {
        return prepareJobTimeline(events);
    }, [events]);

    const handleHoverEvent = (e: HoverEvent<JobLineEvent>) => {
        setHEvent(e);
    };

    const handleLeftEvent = () => {
        setHEvent(undefined);
    };

    const handleEventClick = (e: EventsSelectedEvent<JobLineEvent>) => {
        console.log(e);
    };

    return (
        <div className={block()} onMouseLeave={handleLeftEvent}>
            {hEvent && <EventTimelineTooltip event={hEvent.detail} />}

            <Timeline
                start={interval.from}
                end={interval.to}
                axes={axes}
                axesOptions={{
                    trackHeight: TIMELINE_HEIGHT,
                    eventOffset: OFFSET,
                }}
                events={timelines}
                theme="light"
                eventsSelected={handleEventClick}
                hoverEvent={handleHoverEvent}
                leftEvent={handleLeftEvent}
            />
        </div>
    );
};
