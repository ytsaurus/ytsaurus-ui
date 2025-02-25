import React, {FC, PropsWithChildren} from 'react';
import {EventsTimeline, Props as EventsTimelineProps} from './EventsTimeline';
import {Item, TimelineTable} from './TimelineTable';
import {GroupCollapse, Props as GroupCollapseProps} from './GroupCollapse';
import {TimelineEvent} from '../../packages/ya-timeline';

type Props<T extends TimelineEvent> = {
    tableItems: Item[];
    rowHeight: number;
    collapse?: GroupCollapseProps;
    className?: string;
} & EventsTimelineProps<T>;

const Wrap: FC<PropsWithChildren<{collapse?: GroupCollapseProps}>> = ({children, collapse}) =>
    collapse ? (
        <GroupCollapse {...collapse}>{children}</GroupCollapse>
    ) : (
        <React.Fragment>{children}</React.Fragment>
    );

export const TimelineBlock = <T extends TimelineEvent>({
    className,
    timelines,
    axes,
    rowHeight,
    selectedJob,
    interval,
    tableItems,
    collapse,
    tooltip,
    renderers,
    onTimelineClick,
    onBoundsChanged,
}: Props<T>) => {
    return (
        <Wrap collapse={collapse}>
            <div className={className}>
                <TimelineTable items={tableItems} rowHeight={rowHeight} />
                <EventsTimeline<T>
                    timelines={timelines}
                    axes={axes}
                    selectedJob={selectedJob}
                    interval={interval}
                    rowHeight={rowHeight}
                    onTimelineClick={onTimelineClick}
                    onBoundsChanged={onBoundsChanged}
                    tooltip={tooltip}
                    renderers={renderers}
                />
            </div>
        </Wrap>
    );
};
