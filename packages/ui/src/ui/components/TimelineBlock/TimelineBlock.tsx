import React, {FC, PropsWithChildren, useCallback, useEffect, useRef} from 'react';
import {
    MarkerSelectEvent,
    SelectEvent,
    Timeline,
    TimelineEvent,
    TimelineMarker,
} from '@gravity-ui/timeline';
import {TimelineCanvas, useTimelineEvent} from '@gravity-ui/timeline/react';
import {Flex} from '@gravity-ui/uikit';
import {GroupCollapse, Props as GroupCollapseProps} from './GroupCollapse';
import {EventPopup} from './EventPopup';
import cn from 'bem-cn-lite';
import {VirtualList} from '../List/VirtualList';
import './TimelineBlock.scss';

const MAX_LIST_VISIBLE_COUNT = 25;

const block = cn('yt-events-block');

type Interval = {from: number; to: number};

type Props<TEvent extends TimelineEvent, TMarker extends TimelineMarker> = {
    listItems: string[];
    rowHeight: number;
    topPadding: number;
    className?: string;
    timeline: Timeline<TEvent, TMarker>;
    selectedJob: string;
    tooltip: (event?: TEvent) => React.ReactNode;
    onTimelineClick: (events: SelectEvent<TEvent>) => void;
    onMarkerClick: (markers: MarkerSelectEvent<TMarker>) => void;
    onCameraChange: (interval: Interval) => void;
};

const Wrap: FC<PropsWithChildren<{collapse?: GroupCollapseProps}>> = ({children, collapse}) =>
    collapse ? (
        <GroupCollapse {...collapse}>{children}</GroupCollapse>
    ) : (
        <React.Fragment>{children}</React.Fragment>
    );

export const TimelineBlock = <TEvent extends TimelineEvent, TMarker extends TimelineMarker>({
    className,
    listItems,
    timeline,
    selectedJob,
    rowHeight,
    topPadding,
    tooltip,
    onTimelineClick,
    onMarkerClick,
    onCameraChange,
}: Props<TEvent, TMarker>) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const timelineWrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selectedEvents = timeline.api.getSelectedEvents();
        if (!selectedJob && selectedEvents.length !== 0) {
            timeline.api.setSelectedEvents([]);
        }
    }, [selectedJob, timeline.api]);

    const handleScroll = useCallback(() => {
        if (sidebarRef.current) {
            timeline.api.setCanvasScrollTop(sidebarRef.current.scrollTop);
        }
    }, [timeline.api]);

    useTimelineEvent(timeline, 'on-camera-change', onCameraChange);

    useTimelineEvent(timeline, 'on-select-change', onTimelineClick);

    useTimelineEvent(timeline, 'on-marker-select-change', onMarkerClick);

    return (
        <Wrap>
            <Flex
                className={block(null, className)}
                style={{
                    height: `${Math.min(listItems.length, MAX_LIST_VISIBLE_COUNT) * rowHeight + topPadding}px`,
                }}
            >
                <VirtualList
                    className={block('list')}
                    items={listItems}
                    itemHeight={rowHeight}
                    scrollRef={sidebarRef}
                    renderItem={(item) => (
                        <Flex
                            className={block('list-item')}
                            alignItems="center"
                            justifyItems="center"
                        >
                            <div className={block('list-item-content')}>{item}</div>
                        </Flex>
                    )}
                    onWrapperScroll={handleScroll}
                />
                <div ref={timelineWrapRef} className={block('timeline')}>
                    <TimelineCanvas timeline={timeline} />
                    <EventPopup timeline={timeline} content={tooltip} />
                </div>
            </Flex>
        </Wrap>
    );
};
