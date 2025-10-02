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

import i18n from './i18n';

function JobsMonitor() {
    const cluster = useSelector(getCluster);
    const allJobDescriptors = useSelector(getUniqueJobsMonitorDescriptors);
    const limitedJobDescriptors = useSelector(getLimitedJobsMonitorDescriptors);
    const {from, to} = useSelector(getJobsMonitorFromTo);
    const error = useSelector(getJobsMonitorError);
    const loaded = useSelector(getJobsMonitorItemsLoaded);
    const loading = useSelector(getJobsMonitorItemsLoading);

    const job_descriptor = useMemo(() => limitedJobDescriptors.join('|'), [limitedJobDescriptors]);

    const alert = useMemo(() => {
        return allJobDescriptors.length > MAX_DESCRIPTORS_COUNT ? (
            <Alert
                message={i18n('alert_descriptors-limited', {limit: MAX_DESCRIPTORS_COUNT})}
                theme="warning"
            />
        ) : undefined;
    }, [allJobDescriptors]);

    if (!loaded && loading) {
        return <Loader visible centered />;
    }

    if (!job_descriptor && !error) {
        return <NoContent warning={i18n('alert_no-jobs-with-monitoring-descriptor')} />;
    }

    const JobMonitorComponent = UIFactory.getMonitorComponentForJob()!;

    return (
        <ErrorBoundary>
            <Flex direction="column" gap={1}>
                {error && <YTErrorBlock error={error} />}
                <JobMonitorComponent {...{cluster, job_descriptor, from, to}} alerts={alert} />
            </Flex>
        </ErrorBoundary>
    );
}

export default React.memo(JobsMonitor);
