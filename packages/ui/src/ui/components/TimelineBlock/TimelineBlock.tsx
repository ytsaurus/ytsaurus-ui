import React, {FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef} from 'react';
import {SelectEvent, Timeline, TimelineEvent} from '@gravity-ui/timeline';
import {TimelineCanvas, useTimelineEvent} from '@gravity-ui/timeline/react';
import {Flex} from '@gravity-ui/uikit';
import {GroupCollapse, Props as GroupCollapseProps} from './GroupCollapse';
import {EventPopup} from './EventPopup';
import cn from 'bem-cn-lite';
import {TimelineJob} from '../../store/reducers/operations/jobs/jobs-timeline-slice';
import {prepareJobEvents} from '../../pages/operations/OperationDetail/tabs/JobsTimeline/helpers/prepareJobEvents';
import {VirtualList} from '../../pages/query-tracker/Plan/components/List/VirtualList';

import './TimelineBlock.scss';

const block = cn('yt-events-block');

type Interval = {from: number; to: number};

type Props<TEvent extends TimelineEvent> = {
    group: {title: string; items: TimelineJob[]; listItems: string[]};
    rowHeight: number;
    className?: string;
    timeline: Timeline<TEvent>;
    filter: string;
    selectedJob: string;
    tooltip: (event?: TEvent) => React.ReactNode;
    onTimelineClick: (events: SelectEvent) => void;
    onCameraChange: (interval: Interval) => void;
};

const Wrap: FC<PropsWithChildren<{collapse?: GroupCollapseProps}>> = ({children, collapse}) =>
    collapse ? (
        <GroupCollapse {...collapse}>{children}</GroupCollapse>
    ) : (
        <React.Fragment>{children}</React.Fragment>
    );

export const TimelineBlock = <TEvent extends TimelineEvent>({
    className,
    timeline,
    group,
    filter,
    selectedJob,
    rowHeight,
    tooltip,
    onTimelineClick,
    onCameraChange,
}: Props<TEvent>) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const timelineWrapRef = useRef<HTMLDivElement>(null);

    const events = useMemo(() => {
        return prepareJobEvents({
            jobs: group.items,
            filter,
            selectedJob: selectedJob ? [selectedJob] : [],
        });
    }, [filter, group.items, selectedJob]);

    useEffect(() => {
        timeline.api.setEvents(events);
    }, [events]);

    useEffect(() => {
        const selectedEvents = timeline.api.getSelectedEvents();
        if (!selectedJob && selectedEvents.length !== 0) {
            timeline.api.setSelectedEvents([]);
        }
    }, [selectedJob]);

    const handleScroll = useCallback(() => {
        if (sidebarRef.current) {
            timeline.api.setCanvasScrollTop(sidebarRef.current.scrollTop);
        }
    }, [timeline.api]);

    useTimelineEvent(timeline, 'on-camera-change', onCameraChange);

    useTimelineEvent(timeline, 'on-select-change', onTimelineClick);

    return (
        <Wrap collapse={{title: group.title}}>
            <Flex
                className={block(null, className)}
                style={{height: `${Math.min(group.listItems.length, 25) * rowHeight}px`}}
            >
                <VirtualList
                    className={block('list')}
                    items={group.listItems}
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
