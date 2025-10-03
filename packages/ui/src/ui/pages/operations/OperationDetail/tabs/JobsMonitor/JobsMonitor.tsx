import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {YTErrorBlock} from '../../../../../components/Error/Error';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import Loader from '../../../../../components/Loader/Loader';
import {NoContent} from '../../../../../components/NoContent/NoContent';
import {
    MAX_DESCRIPTORS_COUNT,
    getJobsMonitorError,
    getJobsMonitorFromTo,
    getJobsMonitorItemsLoaded,
    getJobsMonitorItemsLoading,
    getLimitedJobsMonitorDescriptors,
    getUniqueJobsMonitorDescriptors,
} from '../../../../../store/selectors/operations/jobs-monitor';
import {getCluster} from '../../../../../store/selectors/global';
import UIFactory from '../../../../../UIFactory';
import {Alert, Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './JobsMonitor.scss';

import i18n from './i18n';
const block = cn('yt-jobs-monitor');

function JobsMonitor() {
    const cluster = useSelector(getCluster);
    const allJobDescriptors = useSelector(getUniqueJobsMonitorDescriptors);
    const limitedJobDescriptors = useSelector(getLimitedJobsMonitorDescriptors);
    const {from, to} = useSelector(getJobsMonitorFromTo);
    const error = useSelector(getJobsMonitorError);
    const loaded = useSelector(getJobsMonitorItemsLoaded);
    const loading = useSelector(getJobsMonitorItemsLoading);

    const job_descriptor = useMemo(() => limitedJobDescriptors.join('|'), [limitedJobDescriptors]);
    const hasExceededLimit = allJobDescriptors.length > MAX_DESCRIPTORS_COUNT;

    if (!loaded && loading) {
        return <Loader visible centered />;
    }

    if (!job_descriptor && !error) {
        return <NoContent warning={i18n('alert_no-jobs-with-monitoring-descriptor')} />;
    }

    const JobMonitorComponent = UIFactory.getMonitorComponentForJob()!;

    return (
        <ErrorBoundary>
            <Flex
                direction="column"
                gap={1}
                className={block({'exceeded-limit': hasExceededLimit})}
            >
                {error && <YTErrorBlock error={error} />}
                {hasExceededLimit && (
                    <Alert
                        message={i18n('alert_descriptors-limited', {limit: MAX_DESCRIPTORS_COUNT})}
                        theme="warning"
                    />
                )}
                <JobMonitorComponent {...{cluster, job_descriptor, from, to}} />
            </Flex>
        </ErrorBoundary>
    );
}

export default React.memo(JobsMonitor);
