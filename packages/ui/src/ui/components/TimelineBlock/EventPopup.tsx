import React, {useCallback, useEffect, useRef, useState} from 'react';
import {HoverEvent, Timeline, TimelineEvent, TimelineMarker} from '@gravity-ui/timeline';
import {useTimelineEvent} from '@gravity-ui/timeline/react';
import {Popup} from '@gravity-ui/uikit';

type Props<TEvent extends TimelineEvent, TMarker extends TimelineMarker> = {
    content: (event: TEvent) => React.ReactNode;
    timeline: Timeline<TEvent, TMarker>;
    parentRef?: React.RefObject<HTMLDivElement>;
    delay?: number;
};

type Position = {x0: number; x1: number; y0: number; h: number};

export const EventPopup = <
    TEvent extends TimelineEvent = TimelineEvent,
    TMarker extends TimelineMarker = TimelineMarker,
>({
    timeline,
    content,
    parentRef,
    delay = 400,
}: Props<TEvent, TMarker>) => {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [eventData, setEventData] = useState<{event: TEvent; position: Position} | undefined>(
        undefined,
    );
    const [showPopup, setShowPopup] = useState(false);
    const hoverTimeout = useRef<NodeJS.Timeout>();

    useEffect(() => {
        return () => {
            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
            }
        };
    }, []);

    const handleEventsHover = useCallback(
        ({events}: HoverEvent<TEvent>) => {
            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
            }

            const jobEvent = events.find((e) => 'jobId' in e);
            if (!jobEvent) return;

            const position = timeline.api.getEventPosition(jobEvent);
            setEventData({event: jobEvent, position});

            hoverTimeout.current = setTimeout(() => {
                setShowPopup(true);
            }, delay);
        },
        [delay, timeline.api],
    );

    const handleEventLeave = useCallback(() => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        setShowPopup(false);
        setEventData(undefined);
    }, []);

    const handleParentLeave = useCallback(
        (e: MouseEvent) => {
            if (parentRef && parentRef.current && parentRef.current.contains(e.target as Node)) {
                return;
            }
            handleEventLeave();
        },
        [handleEventLeave, parentRef],
    );

    useEffect(() => {
        document.addEventListener('mouseleave', handleParentLeave);

        return () => {
            document.removeEventListener('mouseleave', handleParentLeave);
        };
    }, [handleParentLeave, parentRef]);

    useTimelineEvent(timeline, 'on-hover', handleEventsHover);

    useTimelineEvent(timeline, 'on-leave', handleEventLeave);

    useTimelineEvent(timeline, 'on-camera-change', handleEventLeave);

    if (!eventData) return null;

    return (
        <>
            <div
                ref={anchorRef}
                style={{
                    position: 'absolute',
                    top: eventData.position.y0 - eventData.position.h / 2,
                    left: eventData.position.x0,
                    width: eventData.position.x1 - eventData.position.x0,
                    height: eventData.position.h,
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            ></div>
            <Popup
                key={eventData.event.id}
                anchorElement={anchorRef.current}
                open={showPopup}
                onOpenChange={handleEventLeave}
            >
                <div onMouseLeave={handleEventLeave}>{content(eventData.event)}</div>
            </Popup>
        </>
    );
};
