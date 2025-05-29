import React from 'react';
import withLazyLoading from '../../../../hocs/withLazyLoading';

export const QueriesGraphLazy = withLazyLoading(
    React.lazy(() => import(/* webpackChunkName: "yt-queries-graph" */ './QueriesGraph')),
);
