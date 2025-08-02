import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import(/* webpackChunkName: "dashboard" */ './index');
}

export const Dashboard2Lazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).Dashboard};
    }),
);

export const Dashboard2TopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).DashboardTopRow};
    }),
    false,
);
