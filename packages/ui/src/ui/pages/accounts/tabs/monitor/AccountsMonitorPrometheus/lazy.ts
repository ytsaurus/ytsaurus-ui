import React from 'react';
import withLazyLoading from '../../../../../hocs/withLazyLoading';

function importPage() {
    return import(
        /* webpackChunkName: "accounts-monitoring-prometheus" */ './AccountsMonitorPrometheus'
    );
}

export const AccountsMonitoringPrometheusLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).AccountsMonitorPrometheus};
    }),
    '',
);
