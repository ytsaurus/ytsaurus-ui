import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import('./index');
}

export const TabletCellBundlesLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).TabletCellBundles};
    }),
);

export const TabletCellBundlesTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).TabletCellBundlesTopRow};
    }),
);

export const ChaosCellBundlesTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).ChaosCellBundlesTopRow};
    }),
    '',
);
