import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import(/* webpackChunkName: "dashboard" */ './index');
}

export const DashboardLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).Dashboard};
    }),
);

export const DashboardTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).DashboardTopRow};
    }),
    '',
);
