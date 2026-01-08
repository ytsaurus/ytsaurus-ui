import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const PrometheusDashboardLazy = withLazyLoading(
    React.lazy(async () => ({
        default: (
            await import(/* webpackChunkName: "prometheus-dashboard" */ './PrometheusDashboard')
        ).PrometheusDashboard,
    })),
);
