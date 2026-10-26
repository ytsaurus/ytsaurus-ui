import React, {type FC, useCallback, useLayoutEffect, useRef} from 'react';
import './JobsTimeline.scss';
import cn from 'bem-cn-lite';
import {Alert, Flex, Loader} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectError,
    selectEventsInterval,
    selectInterval,
    selectJobsEmptyError,
    selectJobsOverloadError,
    selectLoading,
} from '../../../../../store/selectors/operations/jobs-timeline';
import {
    cancelJobsTimelineRequest,
    getJobsWithEvents,
} from '../../../../../store/actions/operations/jobs-timeline';
import {TimeLineHeader} from './TimeLineHeader';
import {OperationTimeline} from './OperationTimeline';
import {useUpdaterWithMemoizedParams} from '../../../../../hooks/use-updater';
import WithStickyToolbar from '../../../../../components/WithStickyToolbar/WithStickyToolbar';
import {MAX_JOBS_COUNT} from './constants';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import i18n from './i18n';

import {selectCluster} from '../../../../../store/selectors/global';
import {selectOperationId} from '../../../../../store/selectors/operations/operation';
import {setSelectedJob} from '../../../../../store/reducers/operations/jobs/jobs-timeline-slice';

const block = cn('yt-jobs-timeline');

export const JobsTimeline: FC = () => {
    const dispatch = useDispatch();
    const firstUpdate = useRef<boolean>(true);
    const cluster = useSelector(selectCluster);
    const operationId = useSelector(selectOperationId);
    const eventsRange = useSelector(selectEventsInterval);
    const overloadError = useSelector(selectJobsOverloadError);
    const emptyError = useSelector(selectJobsEmptyError);
    const isLoading = useSelector(selectLoading);
    const interval = useSelector(selectInterval);
    const error = useSelector(selectError);

    // Clear the previous visit's selection before painting, including route changes.
    useLayoutEffect(() => {
        dispatch(setSelectedJob(''));
        firstUpdate.current = true;
        return () => {
            cancelJobsTimelineRequest();
            dispatch(setSelectedJob(''));
        };
    }, [dispatch, cluster, operationId]);

    const handleUpdate = useCallback(async () => {
        const firstRequest = firstUpdate.current;
        firstUpdate.current = false;
        await dispatch(getJobsWithEvents(firstRequest));
    }, [dispatch]);

    useUpdaterWithMemoizedParams<[string, string]>(handleUpdate, undefined, cluster, operationId);

    if (error) {
        return <YTErrorBlock error={error} />;
    }

    if (emptyError) {
        return <Alert theme="info" message={i18n('alert_no-jobs-to-display')} />;
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
            content={
                <>
                    {overloadError && (
                        <Alert
                            theme="warning"
                            message={i18n('alert_data-incomplete', {count: MAX_JOBS_COUNT})}
                            className={block('overload-alert')}
                        />
                    )}
                    <OperationTimeline />
                </>
            }
            className={block()}
            padding="skip-horizontal"
        />
    );
};
