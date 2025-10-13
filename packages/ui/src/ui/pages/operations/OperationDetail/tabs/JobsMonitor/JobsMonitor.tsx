import React from 'react';
import {useSelector} from 'react-redux';

import {YTErrorBlock} from '../../../../../components/Error/Error';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import Loader from '../../../../../components/Loader/Loader';
import {NoContent} from '../../../../../components/NoContent/NoContent';
import {
    getJobsMonitorError,
    getJobsMonitorFromTo,
    getJobsMonitorItemsLoaded,
    getJobsMonitorItemsLoading,
    getJobsMonitoringItemsWithDescriptor,
} from '../../../../../store/selectors/operations/jobs-monitor';
import {getCluster} from '../../../../../store/selectors/global';
import UIFactory from '../../../../../UIFactory';
import {Flex} from '@gravity-ui/uikit';

import i18n from './i18n';
import {getOperation} from '../../../../../store/selectors/operations/operation';

function JobsMonitor() {
    const cluster = useSelector(getCluster);
    const allJobs = useSelector(getJobsMonitoringItemsWithDescriptor);
    const operation = useSelector(getOperation);
    const {from, to} = useSelector(getJobsMonitorFromTo);
    const error = useSelector(getJobsMonitorError);
    const loaded = useSelector(getJobsMonitorItemsLoaded);
    const loading = useSelector(getJobsMonitorItemsLoading);

    if (!loaded && loading) {
        return <Loader visible centered />;
    }

    if (!allJobs.length && !error) {
        return <NoContent warning={i18n('alert_no-jobs-with-monitoring-descriptor')} />;
    }

    const JobMonitorComponent = UIFactory.getMonitorComponentForJob()!;

    return (
        <ErrorBoundary>
            <Flex direction="column" gap={1}>
                {error && <YTErrorBlock error={error} />}
                <JobMonitorComponent
                    cluster={cluster}
                    from={from}
                    to={to}
                    operation={operation}
                    jobs={allJobs}
                />
            </Flex>
        </ErrorBoundary>
    );
}

export default React.memo(JobsMonitor);
