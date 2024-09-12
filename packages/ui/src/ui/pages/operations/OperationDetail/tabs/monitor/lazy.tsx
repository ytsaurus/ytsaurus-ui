import withLazyLoading from '../../../../../hocs/withLazyLoading';
import React from 'react';

export const OperationDetailsMonitorLinksLazy = withLazyLoading(
    React.lazy(
        async () =>
            await import(
                /* webpackChunkName: "operation-details-monitor-links" */ './OperationDetailsMonitorLinks'
            ),
    ),
);
