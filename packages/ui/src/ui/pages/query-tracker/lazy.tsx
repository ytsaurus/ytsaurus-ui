import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importQT() {
    return import('./index');
}

export const QueryTrackerLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importQT()).QueryTracker};
    }),
);

export const QueryTrackerTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importQT()).QueryTrackerTopRow};
    }),
    '',
);
