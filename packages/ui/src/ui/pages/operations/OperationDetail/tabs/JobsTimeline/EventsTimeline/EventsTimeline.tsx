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
import {OFFSET, ROW_HEIGHT, TIMELINE_HEIGHT} from '../constants';
import {useSidePanel} from '../../../../../../hooks/use-side-panel';
import {EventsSidePanel} from '../EventsSidePanel';
import {useThemeValue} from '@gravity-ui/uikit';

const block = cn('yt-events-timeline');

type Props = {
    jobs: Record<string, TimelineJob>;
    interval: Interval;
    onTimelineClick: (jobId: string | null) => void;
};

export const EventsTimeline: FC<Props> = ({jobs, interval, onTimelineClick}) => {
    const theme = useThemeValue();
    const [hEvent, setHEvent] = useState<HoverEvent<JobLineEvent>>();

    const {openWidget, closeWidget, widgetContent} = useSidePanel('JobsTimeline', {
        renderContent({onClose}) {
            return <EventsSidePanel onClose={onClose} />;
        },
    });

    const {axes, timelines} = useMemo(() => {
        return prepareJobTimeline(jobs);
    }, [jobs]);

    const handleHoverEvent = useCallback((e: HoverEvent<JobLineEvent>) => {
        setHEvent(e);
    }, []);

    const handleLeftEvent = useCallback(() => {
        setHEvent(undefined);
    }, []);

    const handleEventClick = useCallback(
        (e: EventsSelectedEvent<JobLineEvent>) => {
            if (!e.detail.events.length) {
                onTimelineClick(null);
                closeWidget();
                return;
            }

            onTimelineClick(e.detail.events[0].axisId);
            openWidget();
        },
        [closeWidget, onTimelineClick, openWidget],
    );

    return (
        <div
            className={block()}
            onMouseLeave={handleLeftEvent}
            style={{
                height: `${axes.length * ROW_HEIGHT}px`,
            }}
        >
            {hEvent && <EventTimelineTooltip event={hEvent.detail} />}

            <Timeline
                theme={theme}
                start={interval.from}
                end={interval.to}
                axes={axes}
                axesOptions={{
                    trackHeight: TIMELINE_HEIGHT,
                    eventOffset: OFFSET,
                }}
                events={timelines}
                eventsSelected={handleEventClick}
                hoverEvent={handleHoverEvent}
                leftEvent={handleLeftEvent}
            />
            {widgetContent}
        </div>
    );
};
