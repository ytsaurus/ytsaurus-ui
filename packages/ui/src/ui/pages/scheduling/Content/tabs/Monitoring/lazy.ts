import React from 'react';
import withLazyLoading from '../../../../../hocs/withLazyLoading';

function importPage() {
    return import(
        /* webpackChunkName: "scheduling-monitoring-prometheus" */ './SchedulingMonitoring'
    );
}

export const SchedulingMonitoringLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).SchedulingMonitoring};
    }),
    '',
);
