import React, {FC, useCallback, useMemo, useState} from 'react';
import {Timeline} from './EventCanvas';
import {
    Interval,
    TimelineJob,
} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {
    EventsSelectedEvent,
    HoverEvent,
} from '../../../../../../packages/ya-timeline/components/Events';
import './EventsTimeline.scss';
import cn from 'bem-cn-lite';
import {prepareJobTimeline} from '../helpers/prepareJobTimeline';
import {JobLineEvent} from './renderer/JobLineRenderer';
import {EventTimelineTooltip} from './EventTimelineTooltip';
import {ROW_HEIGHT} from '../constants';
import {useThemeValue} from '@gravity-ui/uikit';
import {BoundsChangedEvent} from '../../../../../../packages/ya-timeline';

const block = cn('yt-events-timeline');

type Props = {
    jobs: TimelineJob[];
    selectedJob?: string[];
    interval: Interval;
    filter?: string;
    onTimelineClick: (jobId: {id: string; timelineId: string}) => void;
    onBoundsChanged: (interval: Interval) => void;
};

export const EventsTimeline: FC<Props> = ({
    jobs,
    selectedJob,
    interval,
    filter,
    onTimelineClick,
    onBoundsChanged,
}) => {
    const theme = useThemeValue();
    const [hEvent, setHEvent] = useState<HoverEvent<JobLineEvent>>();

    const {axes, timelines} = useMemo(() => {
        return prepareJobTimeline({jobs, selectedJob, filter});
    }, [filter, jobs, selectedJob]);

    const handleHoverEvent = useCallback((e: HoverEvent<JobLineEvent>) => {
        setHEvent(e);
    }, []);

    const handleLeftEvent = useCallback(() => {
        setHEvent(undefined);
    }, []);

    const handleEventClick = useCallback(
        (e: EventsSelectedEvent<JobLineEvent>) => {
            const events = e.detail.events;
            if (!events.length) {
                onTimelineClick({id: '', timelineId: ''});
                return;
            }

            const job = events.find((event) => event.renderType === 'jobLine');
            if (!job) return;

            onTimelineClick({
                id: job.jobId,
                timelineId: `jobLine:${job.axisId}:${job.from}-${job.to}`,
            });
        },
        [onTimelineClick],
    );

    const scrollTopChanged = useCallback(
        ({detail}: BoundsChangedEvent) => {
            onBoundsChanged({from: detail.start, to: detail.end});
        },
        [onBoundsChanged],
    );

    return (
        <div
            className={block()}
            onMouseLeave={handleLeftEvent}
            style={{
                height: `${axes.length * ROW_HEIGHT}px`,
            }}
        >
            {hEvent && <EventTimelineTooltip events={hEvent.detail} />}

            <Timeline
                theme={theme}
                start={interval.from}
                end={interval.to}
                axes={axes}
                selectedEvents={selectedJob}
                events={timelines}
                eventsSelected={handleEventClick}
                hoverEvent={handleHoverEvent}
                leftEvent={handleLeftEvent}
                isZoomAllowed
                boundsChanged={scrollTopChanged}
            />
        </div>
    );
};
