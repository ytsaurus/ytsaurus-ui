import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';
import {withDisableMaxContentWidth} from '../../containers/MaxContentWidth';

function importPage() {
    return import(/* webpackChunkName: "bundles" */ './index');
}

export const TabletCellBundlesLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importPage()).TabletCellBundles};
        }),
    ),
);

export const TabletCellBundlesTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).TabletCellBundlesTopRow};
    }),
);

export const ChaosCellBundlesTopRowLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importPage()).ChaosCellBundlesTopRow};
        }),
        '',
    ),
);
