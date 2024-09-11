import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import('./index');
}

export const SchedulingLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).Scheduling};
    }),
);

export const SchedulingTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).SchedulingTopRow};
    }),
    '',
);
