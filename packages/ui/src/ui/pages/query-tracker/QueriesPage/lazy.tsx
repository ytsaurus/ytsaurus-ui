import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

export const QueriesPageLazy = withLazyLoading(
    React.lazy(() =>
        import(/* webpackChunkName: "queries-page" */ './QueriesPage').then(({QueriesPage}) => ({
            default: QueriesPage,
        })),
    ),
);
