import React, {FC, useCallback, useEffect, useMemo, useRef} from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {SelectEvent, Timeline, TimelineState} from '@gravity-ui/timeline';
import {
    selectActiveJob,
    selectFilter,
    selectInterval,
    selectJobsInIntervalByGroup,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {
    Interval,
    setInterval,
    setSelectedJob,
} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {useSidePanel} from '../../../../../../hooks/use-side-panel';
import {EventsSidePanel} from '../EventsSidePanel';
import {
    JobLineEvent,
    JobLineRenderer,
} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import {AllocationLineEvent} from '../../../../../../components/TimelineBlock/renderer/AllocationLineRenderer';
import {EventTimelineTooltipContent} from '../EventsTimeline/EventTimelineTooltipContent';
import {ROW_HEIGHT} from '../constants';
import './JobsGroups.scss';
import {TimelineBlock} from '../../../../../../components/TimelineBlock/TimelineBlock';
import {prepareAxis} from '../helpers/prepareAxes';
import {prepareMarkers} from '../helpers/prepareMarkers';

const block = cn('yt-timeline-event-group');

export const JobsGroups: FC = () => {
    const dispatch = useDispatch();
    const {groups, groupNames} = useSelector(selectJobsInIntervalByGroup);
    const interval = useSelector(selectInterval);
    const timelineId = useSelector(selectActiveJob);
    const filter = useSelector(selectFilter);
    const timelinesRef = useRef<Map<string, Timeline<JobLineEvent | AllocationLineEvent>>>(
        new Map(),
    );

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
        (onClose: () => void) => async (e: MouseEvent) => {
            if (e.target instanceof Element && e.target.localName !== 'events-timeline-canvas') {
                await dispatch(setSelectedJob(''));
                onClose();
            }
        },
        [dispatch],
    );

    const handleMakeTimelineContent = useCallback(
        (event: JobLineEvent | AllocationLineEvent | undefined) => {
            if (!event || !('jobId' in event)) return null;
            return <EventTimelineTooltipContent event={event} />;
        },
        [],
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

    const timelinesCollection = useMemo(() => {
        Array.from(timelinesRef.current.keys()).forEach((key) => {
            if (!groupNames.includes(key)) {
                timelinesRef.current.delete(key);
            }
        });

        return groupNames.map((name) => {
            if (!timelinesRef.current.has(name)) {
                timelinesRef.current.set(
                    name,
                    new Timeline({
                        settings: {
                            start: interval?.from || 0,
                            end: interval?.to || 0,
                            axes: prepareAxis(groups[name].items, 12),
                            events: [],
                            markers: prepareMarkers(groups[name].items),
                            selectedEventIds: [],
                        },
                        viewConfiguration: {
                            axes: {
                                trackHeight: ROW_HEIGHT,
                                lineHeight: 12,
                            },
                            hideRuler: true,
                        },
                    }),
                );
            }

            const timeline = timelinesRef.current.get(name)!;

            // change timeline
            if (timeline.state === TimelineState.READY) {
                const {start, end} = timeline.api.getInterval();

                if (interval && (start !== interval.from || end !== interval.to)) {
                    timeline.api.setRange(interval.from || 0, interval.to || 0);
                }
            }

            return {
                name,
                timeline,
            };
        });
    }, [groupNames, interval, groups]);

    return (
        <>
            <div className={block('wrap')}>
                {timelinesCollection.map(({name, timeline}) => {
                    return (
                        <TimelineBlock<JobLineEvent | AllocationLineEvent>
                            key={name}
                            timeline={timeline}
                            group={groups[name]}
                            filter={filter}
                            selectedJob={timelineId}
                            rowHeight={ROW_HEIGHT}
                            tooltip={handleMakeTimelineContent}
                            onCameraChange={handleBoundsChanged}
                            onTimelineClick={handleTimeLineClick}
                        />
                    );
                })}
            </div>
            <>{widgetContent}</>
        </>
    );
};
