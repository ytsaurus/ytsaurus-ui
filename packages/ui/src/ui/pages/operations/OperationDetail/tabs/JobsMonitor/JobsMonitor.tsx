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
    getUniqueJobsMonitorDescriptors,
} from '../../../../../store/selectors/operations/jobs-monitor';
import {getCluster} from '../../../../../store/selectors/global';
import UIFactory from '../../../../../UIFactory';
import {Alert} from '@gravity-ui/uikit';

import i18n from './i18n';

function JobsMonitor() {
    const cluster = useSelector(getCluster);
    const jobDescriptors = useSelector(getUniqueJobsMonitorDescriptors);
    const {from, to} = useSelector(getJobsMonitorFromTo);
    const error = useSelector(getJobsMonitorError);
    const loaded = useSelector(getJobsMonitorItemsLoaded);
    const loading = useSelector(getJobsMonitorItemsLoading);

    const job_descriptor = useMemo(() => jobDescriptors.join('|'), [jobDescriptors]);

    if (!loaded && loading) {
        return <Loader visible centered />;
    }

    if (!job_descriptor && !error) {
        return <NoContent warning={i18n('alert_no-jobs-with-monitoring-descriptor')} />;
    }

    if (jobDescriptors.length > MAX_DESCRIPTORS_COUNT) {
        return (
            <Alert
                message={i18n('alert_descriptors-limit-exceeded', {limit: MAX_DESCRIPTORS_COUNT})}
                theme="warning"
            />
        );
    }

    const JobMonitorComponent = UIFactory.getMonitorComponentForJob()!;

    return (
        <ErrorBoundary>
            {error && <YTErrorBlock error={error} />}
            <JobMonitorComponent {...{cluster, job_descriptor, from, to}} />
        </ErrorBoundary>
    );
}

export default React.memo(JobsMonitor);
