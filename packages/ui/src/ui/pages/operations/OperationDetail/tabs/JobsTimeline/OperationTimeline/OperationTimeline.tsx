import React, {FC, useCallback, useEffect, useMemo} from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {MarkerSelectEvent, SelectEvent, Timeline} from '@gravity-ui/timeline';
import {
    selectActiveIncarnation,
    selectActiveJob,
    selectFilter,
    selectInterval,
    selectSortedJobs,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {
    Interval,
    setInterval,
    setSelectedIncarnation,
    setSelectedJob,
} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {splitScreen} from '../../../../../../store/actions/global';
import {EventsSidePanel} from '../EventsSidePanel';
import {
    JobLineEvent,
    JobLineRenderer,
} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import {AllocationLineEvent} from '../../../../../../components/TimelineBlock/renderer/AllocationLineRenderer';
import {EventTimelineTooltipContent} from '../EventsTimeline/EventTimelineTooltipContent';
import {ROW_HEIGHT} from '../constants';
import {TimelineBlock} from '../../../../../../components/TimelineBlock/TimelineBlock';
import {prepareAxis} from '../helpers/prepareAxes';
import {prepareMarkers} from '../helpers/prepareMarkers';
import {prepareJobEvents} from '../helpers/prepareJobEvents';
import withSplit from '../../../../../../hocs/withSplit';
import './OperationTimeline.scss';
import {createTimelineConfig} from './createTimelineConfig';
import {IncarnationMarker} from '../../../../../../components/TimelineBlock/renderer/IncarnationMarkerRenderer';
import hammer from '../../../../../../common/hammer';
import {getJobTrackId} from '../helpers/getJobTrackId';

const block = cn('yt-operation-timeline');

export const SidePanelPortal = withSplit(React.Fragment);

export const OperationTimeline: FC = () => {
    const dispatch = useDispatch();
    const jobs = useSelector(selectSortedJobs);
    const interval = useSelector(selectInterval);
    const selectedJobId = useSelector(selectActiveJob);
    const selectedIncarnation = useSelector(selectActiveIncarnation);
    const filter = useSelector(selectFilter);

    const listItems = useMemo(() => {
        const set = jobs.reduce<Set<string>>((acc, job) => {
            acc.add(hammer.format['ReadableField'](getJobTrackId(job)));
            return acc;
        }, new Set());

        return Array.from(set);
    }, [jobs]);

    const timeline = useMemo(() => {
        return new Timeline<JobLineEvent | AllocationLineEvent, IncarnationMarker>(
            createTimelineConfig(),
        );
    }, []);

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

    const handleMarkerClick = useCallback(
        ({markers}: MarkerSelectEvent<IncarnationMarker>) => {
            if (!markers.length || 'group' in markers[0]) {
                dispatch(setSelectedIncarnation(''));
                return;
            }

            dispatch(setSelectedIncarnation(markers[0].incarnationId));
        },
        [dispatch],
    );

    const handleBoundsChanged = useCallback(
        (newInterval: Interval) => {
            dispatch(setInterval(newInterval));
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

    useEffect(() => {
        dispatch(splitScreen('JobsTimeline'));
    }, [dispatch]);

    useEffect(() => {
        if (!timeline.api) return;

        timeline.api.setAxes(prepareAxis(jobs, 12, 15));
        timeline.api.setMarkers(prepareMarkers(jobs));
    }, [jobs, timeline]);

    useEffect(() => {
        if (!timeline.api) return;

        timeline.api.setEvents(
            prepareJobEvents({
                jobs,
                filter,
                selectedIncarnation,
                selectedJob: selectedJobId ? [selectedJobId] : [],
            }),
        );
    }, [jobs, filter, selectedJobId, selectedIncarnation, timeline]);

    useEffect(() => {
        if (!timeline.api || !interval) return;

        timeline.api.setRange(interval.from || 0, interval.to || 0);
    }, [interval, timeline]);

    return (
        <>
            <div className={block('wrap')}>
                <TimelineBlock<JobLineEvent | AllocationLineEvent, IncarnationMarker>
                    className={block('block')}
                    timeline={timeline}
                    listItems={listItems}
                    selectedJob={selectedJobId}
                    rowHeight={ROW_HEIGHT}
                    topPadding={15}
                    tooltip={handleMakeTimelineContent}
                    onCameraChange={handleBoundsChanged}
                    onTimelineClick={handleTimeLineClick}
                    onMarkerClick={handleMarkerClick}
                />
            </div>
            <SidePanelPortal>
                <EventsSidePanel />
            </SidePanelPortal>
        </>
    );
};
