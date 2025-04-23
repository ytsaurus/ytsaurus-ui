import React from 'react';
import withLazyLoading from '../../../../hocs/withLazyLoading';

function importPage() {
    return import(
        /* webpackChunkName: "bundle-monitoring-prometheus" */ './BundleMonitoringPrometheus'
    );
}

export const BundleMonitoringPrometheusLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).BundleMonitoringPrometheus};
    }),
);
