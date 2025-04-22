import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

function importPage() {
    return import(
        /* webpackChunkName: "system-monitoring-prometheus" */ './SystemMonitoringPrometheus'
    );
}

export const SystemMonitoringPrometheusLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).SystemMonitoringPrometheus};
    }),
    '',
);
