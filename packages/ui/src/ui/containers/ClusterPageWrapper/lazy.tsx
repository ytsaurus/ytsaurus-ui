import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const ClusterPageWrapperLazy = withLazyLoading(
    React.lazy(
        async () => import(/* webpackChunkName: "cluster-page-wrapper" */ './ClusterPageWrapper'),
    ),
);
