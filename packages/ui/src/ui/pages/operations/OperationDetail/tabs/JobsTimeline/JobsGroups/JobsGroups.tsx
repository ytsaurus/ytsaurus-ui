import React, {FC, useCallback, useMemo} from 'react';
import {JobsGroupCollapse} from './JobsGroupCollapse';
import cn from 'bem-cn-lite';
import './JobsGroups.scss';
import {JobsTable} from '../JobsTable';
import {EventsTimeline} from '../EventsTimeline';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectInterval,
    selectJobGroupsCount,
    selectJobsInIntervalByGroup,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {
    Interval,
    setInterval,
    setSelectedJobId,
} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import hammer from '../../../../../../common/hammer';

const block = cn('yt-timeline-event-group');

export const JobsGroups: FC = () => {
    const dispatch = useDispatch();
    const jobGroups = useSelector(selectJobsInIntervalByGroup);
    const groupsCount = useSelector(selectJobGroupsCount);
    const interval = useSelector(selectInterval);

    const handleTimeLineClick = useCallback(
        (jobId: string | null) => {
            dispatch(setSelectedJobId(jobId));
        },
        [dispatch],
    );

    const handleBoundsChanged = useCallback(
        (newInterval: Interval) => {
            dispatch(setInterval(newInterval));
        },
        [dispatch],
    );

    return useMemo(() => {
        if (!interval) return [];

        const groupNames = Object.keys(jobGroups).sort();
        return groupNames.map((groupName) => {
            const group = jobGroups[groupName];
            const jobIds = Object.keys(group);
            const title = `${hammer.format['ReadableField'](groupName)} (${jobIds.length} / ${groupsCount[groupName]})`;

            return (
                <JobsGroupCollapse key={groupName} title={title}>
                    <div className={block()}>
                        <JobsTable jobIds={jobIds} />
                        <EventsTimeline
                            jobs={jobGroups[groupName]}
                            interval={interval}
                            onTimelineClick={handleTimeLineClick}
                            onBoundsChanged={handleBoundsChanged}
                        />
                    </div>
                </JobsGroupCollapse>
            );
        });
    }, [interval, jobGroups, groupsCount, handleTimeLineClick, handleBoundsChanged]);
};
