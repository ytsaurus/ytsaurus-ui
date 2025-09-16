import React, {FC, useCallback, useRef} from 'react';
import './JobsTimeline.scss';
import cn from 'bem-cn-lite';
import {Alert, Flex, Loader} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectError,
    selectEventsInterval,
    selectInterval,
    selectJobsEmptyError,
    selectJobsOverloadError,
    selectLoading,
} from '../../../../../store/selectors/operations/jobs-timeline';
import {getJobsWithEvents} from '../../../../../store/actions/operations/jobs-timeline';
import {TimeLineHeader} from './TimeLineHeader';
import {OperationTimeline} from './OperationTimeline';
import {useUpdater} from '../../../../../hooks/use-updater';
import WithStickyToolbar from '../../../../../components/WithStickyToolbar/WithStickyToolbar';
import {MAX_JOBS_COUNT} from './constants';
import {YTErrorBlock} from '../../../../../components/Error/Error';

const block = cn('yt-jobs-timeline');

export const JobsTimeline: FC = () => {
    const dispatch = useDispatch();
    const firstUpdate = useRef<boolean>(true);
    const eventsRange = useSelector(selectEventsInterval);
    const overloadError = useSelector(selectJobsOverloadError);
    const emptyError = useSelector(selectJobsEmptyError);
    const isLoading = useSelector(selectLoading);
    const interval = useSelector(selectInterval);
    const error = useSelector(selectError);

    const handleUpdate = useCallback(async () => {
        await dispatch(getJobsWithEvents(firstUpdate.current));
        firstUpdate.current = false;
    }, [dispatch]);

    useUpdater(handleUpdate);

    if (error) {
        return <YTErrorBlock error={error} />;
    }

    if (overloadError) {
        return (
            <Alert
                theme="info"
                message={`Too many jobs to display. Max number ${MAX_JOBS_COUNT}`}
            />
        );
    }

    if (emptyError) {
        return <Alert theme="info" message={`No jobs to display`} />;
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
        <WithStickyToolbar
            toolbar={<TimeLineHeader />}
            content={<OperationTimeline />}
            className={block()}
            padding="skip-horizontal"
        />
    );
};
