import React, {type FC, useCallback, useEffect, useMemo, useState} from 'react';
import cn from 'bem-cn-lite';
import {useLayer} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {type MarkerSelectEvent, type SelectEvent, Timeline} from '@gravity-ui/timeline';
import {
    selectActiveIncarnation,
    selectActiveJob,
    selectFilter,
    selectInterval,
    selectJobsTimelinePanelPinned,
    selectSelectedJob,
    selectSortedJobs,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {
    type Interval,
    setInterval,
    setSelectedIncarnation,
    setSelectedJob,
} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {mergeScreen, splitScreen} from '../../../../../../store/actions/global';
import {EventsSidePanel} from '../EventsSidePanel';
import {
    type JobLineEvent,
    JobLineRenderer,
} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import {type AllocationLineEvent} from '../../../../../../components/TimelineBlock/renderer/AllocationLineRenderer';
import {ROW_HEIGHT} from '../constants';
import {TimelineBlock} from '../../../../../../components/TimelineBlock/TimelineBlock';
import {prepareAxis} from '../helpers/prepareAxes';
import {prepareMarkers} from '../helpers/prepareMarkers';
import {prepareJobEvents} from '../helpers/prepareJobEvents';
import withSplit from '../../../../../../hocs/withSplit';
import {EventsSidePanelDrawer} from '../EventsSidePanelDrawer/EventsSidePanelDrawer';
import {setSettingByKey} from '../../../../../../store/actions/settings';
import './OperationTimeline.scss';
import {createTimelineConfig} from './createTimelineConfig';
import {type IncarnationMarker} from '../../../../../../components/TimelineBlock/renderer/IncarnationMarkerRenderer';
import hammer from '../../../../../../common/hammer';
import {getJobTrackId} from '../helpers/getJobTrackId';

const block = cn('yt-operation-timeline');

export const SidePanelPortal = withSplit(React.Fragment);

export const OperationTimeline: FC = () => {
    const dispatch = useDispatch();
    const jobs = useSelector(selectSortedJobs);
    const interval = useSelector(selectInterval);
    const selectedJobId = useSelector(selectActiveJob);
    const selectedJob = useSelector(selectSelectedJob);
    const pinned = useSelector(selectJobsTimelinePanelPinned);
    const [savingPin, setSavingPin] = useState(false);
    const isPanelOpen = Boolean(selectedJob);

    const handleClose = () => {
        dispatch(setSelectedJob(''));
    };

    useLayer({open: isPanelOpen && pinned, disableOutsideClick: true, onClose: handleClose});

    const handleTogglePin = async () => {
        if (savingPin) return;
        setSavingPin(true);
        try {
            await dispatch(setSettingByKey('global::operations::jobsTimelinePanelPinned', !pinned));
        } catch {
            // The settings action restores the previous value and shows the error.
        } finally {
            setSavingPin(false);
        }
    };
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
                timeline.api.setSelectedEvents(selectedJobId ? [selectedJobId] : []);
                return;
            }
            const job = events.find((event) => event.renderer instanceof JobLineRenderer);
            if (!job) return;
            dispatch(setSelectedJob(job.id));
        },
        [dispatch, selectedJobId, timeline],
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

    useEffect(() => {
        if (!isPanelOpen || !pinned) return undefined;
        dispatch(splitScreen('JobsTimeline', [block('main-pane'), block('details-pane')]));
        return () => {
            dispatch((dispatchAction, getState) => {
                if (getState().global.splitScreen.type === 'JobsTimeline') {
                    dispatchAction(mergeScreen());
                }
            });
        };
    }, [dispatch, isPanelOpen, pinned]);

    useEffect(() => {
        if (!timeline.api) return;

        timeline.api.setAxes(prepareAxis(jobs, ROW_HEIGHT, 15));
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
        timeline.api.setSelectedEvents(selectedJobId ? [selectedJobId] : []);
    }, [jobs, filter, selectedJobId, selectedIncarnation, timeline]);

    useEffect(() => {
        if (!timeline.api || !interval) return;

        timeline.api.setRange(interval.from || 0, interval.to || 0);
    }, [interval, timeline]);

    const panel = isPanelOpen ? (
        <EventsSidePanel
            pinned={pinned}
            savingPin={savingPin}
            onTogglePin={handleTogglePin}
            onClose={handleClose}
        />
    ) : null;

    return (
        <>
            <div data-qa="jobs-timeline" className={block('wrap')}>
                <TimelineBlock<JobLineEvent | AllocationLineEvent, IncarnationMarker>
                    className={block('block')}
                    timeline={timeline}
                    listItems={listItems}
                    selectedJob={selectedJobId}
                    rowHeight={ROW_HEIGHT}
                    topPadding={15}
                    onCameraChange={handleBoundsChanged}
                    onTimelineClick={handleTimeLineClick}
                    onMarkerClick={handleMarkerClick}
                />
            </div>
            {isPanelOpen && pinned && <SidePanelPortal>{panel}</SidePanelPortal>}
            <EventsSidePanelDrawer open={isPanelOpen && !pinned} onClose={handleClose}>
                {panel}
            </EventsSidePanelDrawer>
        </>
    );
};
