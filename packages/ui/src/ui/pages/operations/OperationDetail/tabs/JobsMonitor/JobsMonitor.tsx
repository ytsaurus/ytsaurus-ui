import React from 'react';
import {useSelector} from 'react-redux';

import {YTErrorBlock} from '../../../../../components/Error/Error';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import Loader from '../../../../../components/Loader/Loader';
import {NoContent} from '../../../../../components/NoContent/NoContent';
import {
    getJobsMonitorDescriptor,
    getJobsMonitorError,
    getJobsMonitorFromTo,
    getJobsMonitorItemsLoaded,
    getJobsMonitorItemsLoading,
} from '../../../../../store/selectors/operations/jobs-monitor';
import {getCluster} from '../../../../../store/selectors/global';
import UIFactory from '../../../../../UIFactory';

function JobsMonitor() {
    const cluster = useSelector(getCluster);
    const job_descriptor = useSelector(getJobsMonitorDescriptor);
    const {from, to} = useSelector(getJobsMonitorFromTo);
    const error = useSelector(getJobsMonitorError);
    const loaded = useSelector(getJobsMonitorItemsLoaded);
    const loading = useSelector(getJobsMonitorItemsLoading);

    if (!loaded && loading) {
        return <Loader visible centered />;
    }

    if (!job_descriptor && !error) {
        return <NoContent warning={'There are no jobs with "monitoring_descriptor"'} />;
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
