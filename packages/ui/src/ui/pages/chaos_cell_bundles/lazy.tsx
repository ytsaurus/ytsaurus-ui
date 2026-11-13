import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';
import {withDisableMaxContentWidth} from '../../containers/MaxContentWidth';

export const ChaosCellBundlesLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            const {ChaosCellBundles} = await import(
                /* webpackChunkName: 'chaos-cell-bundles' */ './ChaosCellBundles/ChaosCellBundles'
            );
            return {default: ChaosCellBundles};
        }),
    ),
);
