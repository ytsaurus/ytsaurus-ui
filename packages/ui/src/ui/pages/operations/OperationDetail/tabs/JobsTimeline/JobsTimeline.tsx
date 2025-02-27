import React, {FC, useEffect} from 'react';
import {TimelineRuler} from '../../../../../components/common/Timeline/TimelineRuler/TimelineRuler';
import './JobsTimeline.scss';
import cn from 'bem-cn-lite';
import {Loader} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectEventsInInterval,
    selectEventsInterval,
    selectInterval,
    selectLoading,
} from '../../../../../store/selectors/operations/jobs-timeline';
import {getJobsWithEvents} from '../../../../../store/actions/operations/jobs-timeline';
import {
    Interval,
    setInterval,
} from '../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {TimelineTable} from './TimelineTable';
import {TimeLineHeader} from './TimeLineHeader';

const block = cn('yt-jobs-timeline');

export const JobsTimeline: FC = () => {
    const dispatch = useDispatch();
    const events = useSelector(selectEventsInInterval);
    const eventsRange = useSelector(selectEventsInterval);
    const isLoading = useSelector(selectLoading);
    const interval = useSelector(selectInterval);

    useEffect(() => {
        dispatch(getJobsWithEvents(true));
    }, [dispatch]);

    if (isLoading) return <Loader />;
    if (!interval || !eventsRange) return null;

    const handleRulerChange = (data: Interval) => {
        dispatch(setInterval(data));
    };

    return (
        <div className={block()}>
            <TimeLineHeader />
            <TimelineRuler
                {...interval}
                minRange={eventsRange.from}
                maxRange={eventsRange.to}
                hasNowButton={false}
                onUpdate={handleRulerChange}
                className={block('timeline-ruler')}
            />
            <TimelineTable events={events} />
        </div>
    );
};
