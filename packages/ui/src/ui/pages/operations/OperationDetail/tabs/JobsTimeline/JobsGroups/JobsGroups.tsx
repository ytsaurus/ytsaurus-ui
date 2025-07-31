import React, {FC, useCallback, useEffect, useMemo} from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {SelectEvent} from '@gravity-ui/timeline';
import {
    selectActiveJob,
    selectFilter,
    selectInterval,
    selectJobGroupsCount,
    selectJobsInIntervalByGroup,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {
    Interval,
    setInterval,
    setSelectedJob,
} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import hammer from '../../../../../../common/hammer';
import {useSidePanel} from '../../../../../../hooks/use-side-panel';
import {EventsSidePanel} from '../EventsSidePanel';
import {prepareJobTimeline} from '../helpers/prepareJobTimeline';
import {
    JobLineEvent,
    JobLineRenderer,
} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import {AllocationLineEvent} from '../../../../../../components/TimelineBlock/renderer/AllocationLineRenderer';
import {EventTimelineTooltipContent} from '../EventsTimeline/EventTimelineTooltipContent';
import {Item} from '../../../../../../components/TimelineBlock/TimelineTable';
import {ROW_HEIGHT} from '../constants';
import './JobsGroups.scss';
import {TimelineBlock} from '../../../../../../components/TimelineBlock/TimelineBlock';

const block = cn('yt-timeline-event-group');

export const JobsGroups: FC = () => {
    const dispatch = useDispatch();
    const jobGroups = useSelector(selectJobsInIntervalByGroup);
    const groupsCount = useSelector(selectJobGroupsCount);
    const interval = useSelector(selectInterval);
    const timelineId = useSelector(selectActiveJob);
    const filter = useSelector(selectFilter);

    const handleTimeLineClick = useCallback(
        ({events}: SelectEvent) => {
            if (!events.length) {
                dispatch(setSelectedJob(''));
                return;
            }

            const job = events.find((event) => event.renderer instanceof JobLineRenderer);
            if (!job) return;

            dispatch(setSelectedJob(job.id));
        },
        [dispatch],
    );

    const handleBoundsChanged = useCallback(
        (newInterval: Interval) => {
            dispatch(setInterval(newInterval));
        },
        [dispatch],
    );

    const handleSidePanelClose = useCallback(
        (onClose: () => void) => () => {
            dispatch(setSelectedJob(''));
            onClose();
        },
        [dispatch],
    );

    const handleSidePanelOutsideClick = useCallback(
        (onClose: () => void) => (e: MouseEvent) => {
            if (e.target instanceof Element && e.target.localName !== 'events-timeline-canvas') {
                dispatch(setSelectedJob(''));
                onClose();
            }
        },
        [dispatch],
    );

    const {openWidget, closeWidget, widgetContent} = useSidePanel('JobsTimeline', {
        renderContent({onClose}) {
            return (
                <EventsSidePanel
                    onClose={handleSidePanelClose(onClose)}
                    onOutsideClick={handleSidePanelOutsideClick(onClose)}
                />
            );
        },
    });

    useEffect(() => {
        const operation = timelineId ? openWidget : closeWidget;
        operation();
    }, [closeWidget, openWidget, timelineId]);

    const groups = useMemo(() => {
        if (!interval) return [];

        const groupNames = Object.keys(jobGroups).sort();
        return groupNames.map((groupName) => {
            const group = jobGroups[groupName].sort(
                (a, b) => Number(a.cookieId) - Number(b.cookieId),
            );
            const readableGroupName = hammer.format['ReadableField'](groupName);
            const title = `${readableGroupName} (${group.length} / ${groupsCount[groupName]})`;

            const tableItems = group.reduce<Record<string, Item>>((acc, item) => {
                if (item.cookieId === undefined) return acc;

                acc[item.cookieId] = {
                    id: `${item.cookieId}: ${item.start_time}-${item.finish_time}`,
                    content: `${readableGroupName} ${item.cookieId}`,
                };
                return acc;
            }, {});

            const {timelines, axes} = prepareJobTimeline({
                jobs: group,
                selectedJob: [timelineId],
                filter,
                axesRowHeight: 12,
            });

            return (
                <TimelineBlock<JobLineEvent | AllocationLineEvent>
                    key={groupName}
                    className={block()}
                    collapse={{title}}
                    tableItems={Object.values(tableItems)}
                    events={timelines}
                    axes={axes}
                    selectedJob={timelineId}
                    interval={interval}
                    rowHeight={ROW_HEIGHT}
                    onCameraChange={handleBoundsChanged}
                    onTimelineClick={handleTimeLineClick}
                    tooltip={(event) => {
                        if (!event || !('jobId' in event)) return null;
                        return <EventTimelineTooltipContent event={event} />;
                    }}
                />
            );
        });
    }, [
        filter,
        groupsCount,
        handleBoundsChanged,
        handleTimeLineClick,
        interval,
        jobGroups,
        timelineId,
    ]);

    return (
        <>
            <div className={block('wrap')}>{groups}</div>
            <>{widgetContent}</>
        </>
    );
};
