import React, {useCallback, useRef, useState} from 'react';
import {HoverEvent, Timeline, TimelineEvent} from '@gravity-ui/timeline';
import {useTimelineEvent} from '@gravity-ui/timeline/react';
import {Popup} from '@gravity-ui/uikit';

type Props<TEvent extends TimelineEvent> = {
    content: (event: TEvent) => React.ReactNode;
    timeline: Timeline<TEvent>;
};

type Position = {x0: number; x1: number; y0: number; h: number};

export const EventPopup = <TEvent extends TimelineEvent = TimelineEvent>({
    timeline,
    content,
}: Props<TEvent>) => {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [eventData, setEventData] = useState<{event: TEvent; position: Position} | undefined>(
        undefined,
    );

    const handleEventsHover = useCallback(
        ({event}: HoverEvent<TEvent>) => {
            const position = timeline.api.getEventPosition(event);

            setEventData({event, position});
        },
        [timeline],
    );

    const handleEventLeave = useCallback(() => {
        setEventData(undefined);
    }, []);

    useTimelineEvent(timeline, 'on-hover', handleEventsHover);

    useTimelineEvent(timeline, 'on-leave', handleEventLeave);

    if (!eventData) return null;

    return (
        <>
            <div
                ref={anchorRef}
                style={{
                    position: 'absolute',
                    top: eventData.position.y0,
                    left: eventData.position.x0,
                    width: eventData.position.x1 - eventData.position.x0,
                    height: eventData.position.h,
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            ></div>
            <Popup
                key={eventData.event.id}
                anchorRef={anchorRef}
                open
                onMouseLeave={handleEventLeave}
                onOutsideClick={handleEventLeave}
            >
                {content(eventData.event)}
            </Popup>
        </>
    );
};
