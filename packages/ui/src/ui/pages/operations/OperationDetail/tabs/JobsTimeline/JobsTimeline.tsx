import React, {FC, useCallback, useRef} from 'react';
import './JobsTimeline.scss';
import cn from 'bem-cn-lite';
import {Alert, Flex, Loader} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectEventsInterval,
    selectInterval,
    selectJobsCountError,
    selectLoading,
} from '../../../../../store/selectors/operations/jobs-timeline';
import {getJobsWithEvents} from '../../../../../store/actions/operations/jobs-timeline';
import {TimeLineHeader} from './TimeLineHeader';
import {JobsGroups} from './JobsGroups';
import {useUpdater} from '../../../../../hooks/use-updater';
import {StickyContainer} from '../../../../../components/StickyContainer/StickyContainer';
import {MAX_JOBS_COUNT} from './constants';

const block = cn('yt-jobs-timeline');

export const JobsTimeline: FC = () => {
    const dispatch = useDispatch();
    const firstUpdate = useRef<boolean>(true);
    const eventsRange = useSelector(selectEventsInterval);
    const countError = useSelector(selectJobsCountError);
    const isLoading = useSelector(selectLoading);
    const interval = useSelector(selectInterval);

    const handleUpdate = useCallback(async () => {
        await dispatch(getJobsWithEvents(firstUpdate.current));
        firstUpdate.current = false;
    }, [dispatch]);

    useUpdater(handleUpdate);

    if (countError) {
        return (
            <Alert
                theme="info"
                message={`Too many jobs to display. Max number ${MAX_JOBS_COUNT}`}
            />
        );
    }

    if (isLoading) {
        return (
            <Flex justifyContent="center">
                <Loader />
            </Flex>
        );
    }

    if (!interval || !eventsRange) return null;

    return (
        <StickyContainer>
            {({stickyTopClassName}) => (
                <div className={block()}>
                    <TimeLineHeader className={stickyTopClassName} />
                    <JobsGroups />
                </div>
            )}
        </StickyContainer>
    );
};
