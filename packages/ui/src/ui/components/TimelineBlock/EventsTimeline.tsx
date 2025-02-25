import React, {useCallback, useMemo, useState} from 'react';
import {Timeline, TimelineRenderer} from './EventCanvas';
import {EventsSelectedEvent, HoverEvent} from '../../packages/ya-timeline/components/Events';
import cn from 'bem-cn-lite';
import {useThemeValue} from '@gravity-ui/uikit';
import debounce_ from 'lodash/debounce';
import {BoundsChangedEvent, TimelineAxis, TimelineEvent} from '../../packages/ya-timeline';
import './EventsTimeline.scss';

const block = cn('yt-events-timeline');
type Interval = {from: number; to: number};

export type Props<T extends TimelineEvent> = {
    axes: TimelineAxis[];
    timelines: T[];
    selectedJob?: string[];
    interval: Interval;
    rowHeight?: number;
    tooltip: (event?: HoverEvent<T>) => React.ReactNode;
    onTimelineClick: (events: T[]) => void;
    onBoundsChanged: (interval: Interval) => void;
    renderers: TimelineRenderer[];
};

const DEFAULT_ROW_HEIGHT = 30;

export const EventsTimeline = <T extends TimelineEvent>({
    axes,
    timelines,
    selectedJob,
    interval,
    rowHeight,
    tooltip,
    onTimelineClick,
    onBoundsChanged,
    renderers,
}: Props<T>) => {
    const theme = useThemeValue();
    const [hoverEvent, setHoverEvent] = useState<HoverEvent<T>>();

    const debouncedSetHoverEvent = useMemo(
        () =>
            debounce_((event: HoverEvent<T> | undefined) => {
                setHoverEvent(event);
            }, 50),
        [],
    );

    const handleLeftEvent = useCallback(() => {
        debouncedSetHoverEvent(undefined);
    }, [debouncedSetHoverEvent]);

    const handleHoverEvent = useCallback(
        (event: HoverEvent<T>) => {
            debouncedSetHoverEvent(event);
        },
        [debouncedSetHoverEvent],
    );

    const handleEventClick = useCallback(
        (e: EventsSelectedEvent<T>) => {
            const events = e.detail.events;
            if (!events.length) {
                onTimelineClick([]);
                return;
            }

            onTimelineClick(events);
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
                height: `${axes.length * (rowHeight || DEFAULT_ROW_HEIGHT)}px`,
            }}
        >
            {tooltip(hoverEvent)}

            <Timeline<T>
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
                renderers={renderers}
            />
        </div>
    );
};
