import React from 'react';
import withLazyLoading from '../../../../../hocs/withLazyLoading';

export const IncarnationsLazy = withLazyLoading(
    React.lazy(() => import(/* webpackChunkName: 'incarnations' */ './Incarnations')),
    '',
);
