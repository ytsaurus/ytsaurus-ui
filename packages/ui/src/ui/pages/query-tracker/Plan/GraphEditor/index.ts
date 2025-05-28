import React from 'react';
import withLazyLoading from '../../../../hocs/withLazyLoading';

export const GraphLazy = withLazyLoading(
    React.lazy(() => import(/* webpackChunkName: "yt-queries-graph" */ './QueriesGraph')),
);
