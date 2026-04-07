import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {YTErrorBlock} from '../../../../../components/Error/Error';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import Loader from '../../../../../components/Loader/Loader';
import {NoContent} from '../../../../../components/NoContent';
import {
    selectJobsMonitorError,
    selectJobsMonitorFromTo,
    selectJobsMonitorItemsLoaded,
    selectJobsMonitorItemsLoading,
    selectJobsMonitoringItemsWithDescriptor,
} from '../../../../../store/selectors/operations/jobs-monitor';
import {selectCluster} from '../../../../../store/selectors/global';
import {selectOperation} from '../../../../../store/selectors/operations/operation';
import UIFactory from '../../../../../UIFactory';
import {Flex} from '@gravity-ui/uikit';

import i18n from './i18n';

function JobsMonitor() {
    const cluster = useSelector(selectCluster);
    const allJobs = useSelector(selectJobsMonitoringItemsWithDescriptor);
    const operation = useSelector(selectOperation);
    const {from, to} = useSelector(selectJobsMonitorFromTo);
    const error = useSelector(selectJobsMonitorError);
    const loaded = useSelector(selectJobsMonitorItemsLoaded);
    const loading = useSelector(selectJobsMonitorItemsLoading);

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
