import React, {FC, PropsWithChildren} from 'react';
import {SelectEvent, TimelineAxis, TimelineEvent} from '@gravity-ui/timeline';
import {Item, TimelineTable} from './TimelineTable';
import {GroupCollapse, Props as GroupCollapseProps} from './GroupCollapse';
import {TimelineCanvas, useTimeline, useTimelineEvent} from '@gravity-ui/timeline/react';
import {EventPopup} from './EventPopup';
import cn from 'bem-cn-lite';
import './TimelineBlock.scss';

const block = cn('yt-events-block');

type Interval = {from: number; to: number};

type Props<TEvent extends TimelineEvent> = {
    tableItems: Item[];
    rowHeight: number;
    collapse?: GroupCollapseProps;
    className?: string;
    axes: TimelineAxis[];
    events: TEvent[];
    selectedJob?: string;
    interval: Interval;
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
    events,
    axes,
    rowHeight,
    selectedJob,
    interval,
    tableItems,
    collapse,
    tooltip,
    onTimelineClick,
    onCameraChange,
}: Props<TEvent>) => {
    const {timeline} = useTimeline({
        settings: {
            start: interval.from,
            end: interval.to,
            axes,
            events,
            selectedEventIds: selectedJob ? [selectedJob] : [],
        },
        viewConfiguration: {
            axes: {
                trackHeight: rowHeight,
                lineHeight: 10,
            },
            hideRuler: true,
        },
    });

    useTimelineEvent(timeline, 'on-camera-change', onCameraChange);

    useTimelineEvent(timeline, 'on-select-change', onTimelineClick);

    return (
        <Wrap collapse={collapse}>
            <div className={className}>
                <TimelineTable items={tableItems} rowHeight={rowHeight} />
                <div
                    className={block('timeline')}
                    style={{
                        height: `${events.length * rowHeight}px`,
                    }}
                >
                    <TimelineCanvas timeline={timeline} />
                    <EventPopup timeline={timeline} content={tooltip} />
                </div>
            </div>
        </Wrap>
    );
};
