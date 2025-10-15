import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const AppNavigationPageLayoutLazy = withLazyLoading(
    React.lazy(async () => {
        return {
            default: (
                await import(
                    /* webpackChunkName: 'app-navigation-page-layout' */ './AppNavigationPageLayout'
                )
            ).AppNavigationPageLayout,
        };
    }),
    '',
);
