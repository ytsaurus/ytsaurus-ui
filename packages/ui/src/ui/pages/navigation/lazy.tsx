import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import('./index');
}

export const NavigationLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).Navigation};
    }),
);

export const NavigationTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).NavigationTopRow};
    }),
);
