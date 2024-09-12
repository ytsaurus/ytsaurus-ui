import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const ClustersMenuLazy = withLazyLoading(
    React.lazy(async () => await import(/* webpackChunkName: "cluster-menu" */ './ClustersMenu')),
);
