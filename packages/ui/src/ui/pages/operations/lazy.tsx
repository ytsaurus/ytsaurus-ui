import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const OperationsLazy = withLazyLoading(
    React.lazy(async () => import(/* webpackChunkName: "operations" */ './Operations/Operations')),
);
