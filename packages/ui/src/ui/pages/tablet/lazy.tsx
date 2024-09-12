import React from 'react';

import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import(/* webpackChunkName: "tablet" */ './index');
}

export const TabletLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).Tablet};
    }),
);

export const TabletTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).TabletTopRow};
    }),
    '',
);
