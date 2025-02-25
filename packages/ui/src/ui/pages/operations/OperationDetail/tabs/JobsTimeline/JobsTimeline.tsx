import React, {FC, useCallback, useEffect, useMemo} from 'react';
import {TimelineRuler} from '../../../../../components/common/Timeline/TimelineRuler/TimelineRuler';
import './JobsTimeline.scss';
import cn from 'bem-cn-lite';
import {Loader} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectEventsInterval,
    selectInterval,
    selectJobsInIntervalByGroup,
    selectLoading,
} from '../../../../../store/selectors/operations/jobs-timeline';
import {getJobsWithEvents} from '../../../../../store/actions/operations/jobs-timeline';
import {
    Interval,
    setInterval,
    setSelectedJobId,
} from '../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {TimeLineHeader} from './TimeLineHeader';
import {EventsGroup} from './EventsGroup';
import {useUpdater} from '../../../../../hooks/use-updater';

const TIMEOUT = 15 * 1000;

const block = cn('yt-jobs-timeline');

export const JobsTimeline: FC = () => {
    const dispatch = useDispatch();
    const jobGroups = useSelector(selectJobsInIntervalByGroup);
    const eventsRange = useSelector(selectEventsInterval);
    const isLoading = useSelector(selectLoading);
    const interval = useSelector(selectInterval);

    useEffect(() => {
        dispatch(getJobsWithEvents(true));
    }, [dispatch]);

    useUpdater(
        () => {
            dispatch(getJobsWithEvents(false));
        },
        {timeout: TIMEOUT},
    );

    const handleRulerChange = useCallback(
        (data: Interval) => {
            dispatch(setInterval(data));
        },
        [dispatch],
    );

    const handleTimeLineClick = useCallback(
        (jobId: string | null) => {
            dispatch(setSelectedJobId(jobId));
        },
        [dispatch],
    );

    const groups = useMemo(() => {
        if (!interval) return [];

        return Object.keys(jobGroups)
            .sort()
            .map((groupName) => {
                return (
                    <EventsGroup
                        key={groupName}
                        groupName={groupName}
                        group={jobGroups[groupName]}
                        interval={interval}
                        onTimelineClick={handleTimeLineClick}
                    />
                );
            });
    }, [jobGroups, handleTimeLineClick, interval]);

    if (isLoading) return <Loader />;
    if (!interval || !eventsRange) return null;

    return (
        <div className={block()}>
            <TimeLineHeader />
            <TimelineRuler
                {...interval}
                hasScaleButtons
                minRange={eventsRange.from}
                maxRange={eventsRange.to}
                hasNowButton={false}
                onUpdate={handleRulerChange}
                className={block('timeline-ruler')}
            />
            {groups}
        </div>
    );
};
