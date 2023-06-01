import React from 'react';
import {useSelector} from 'react-redux';
import {
    getJobsMonitorDescriptor,
    getJobsMonitorFromTo,
} from '../../../../../store/selectors/operations/jobs-monitor';
import {NoContent} from '../../../../../components/NoContent/NoContent';
import {getCluster} from '../../../../../store/selectors/global';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import UIFactory from '../../../../../UIFactory';

function JobsMonitor() {
    const cluster = useSelector(getCluster);
    const job_descriptor = useSelector(getJobsMonitorDescriptor);
    const {from, to} = useSelector(getJobsMonitorFromTo);

    if (!job_descriptor) {
        return <NoContent warning={'There are no jobs with "monitoring_descriptor"'} />;
    }

    const JobMonitorComponent = UIFactory.getMonitorComponentForJob()!;

    return (
        <ErrorBoundary>
            <JobMonitorComponent {...{cluster, job_descriptor, from, to}} />
        </ErrorBoundary>
    );
}

export default React.memo(JobsMonitor);
