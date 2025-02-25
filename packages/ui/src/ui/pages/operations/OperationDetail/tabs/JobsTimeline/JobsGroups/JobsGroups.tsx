import React, {FC, useCallback, useEffect, useMemo} from 'react';
import {JobsGroupCollapse} from './JobsGroupCollapse';
import cn from 'bem-cn-lite';
import './JobsGroups.scss';
import {JobsTable} from '../JobsTable';
import {EventsTimeline} from '../EventsTimeline';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectActiveJob,
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

const block = cn('yt-timeline-event-group');

export const JobsGroups: FC = () => {
    const dispatch = useDispatch();
    const jobGroups = useSelector(selectJobsInIntervalByGroup);
    const groupsCount = useSelector(selectJobGroupsCount);
    const interval = useSelector(selectInterval);
    const {timelineId} = useSelector(selectActiveJob);

    const handleTimeLineClick = useCallback(
        (value: {id: string; timelineId: string}) => {
            dispatch(setSelectedJob(value));
        },
        [dispatch],
    );

    const handleBoundsChanged = useCallback(
        (newInterval: Interval) => {
            dispatch(setInterval(newInterval));
        },
        [dispatch],
    );

    const {openWidget, closeWidget, widgetContent} = useSidePanel('JobsTimeline', {
        renderContent({onClose}) {
            return (
                <EventsSidePanel
                    onClose={() => {
                        handleTimeLineClick({id: '', timelineId: ''});
                        onClose();
                    }}
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
            const title = `${hammer.format['ReadableField'](groupName)} (${group.length} / ${groupsCount[groupName]})`;

            return (
                <JobsGroupCollapse key={groupName} title={title}>
                    <div className={block()}>
                        <JobsTable jobs={group} />
                        <EventsTimeline
                            jobs={group}
                            selectedJob={[timelineId]}
                            interval={interval}
                            onTimelineClick={handleTimeLineClick}
                            onBoundsChanged={handleBoundsChanged}
                        />
                    </div>
                </JobsGroupCollapse>
            );
        });
    }, [groupsCount, handleBoundsChanged, handleTimeLineClick, interval, jobGroups, timelineId]);

    return (
        <>
            {groups}
            <>{widgetContent}</>
        </>
    );
};
