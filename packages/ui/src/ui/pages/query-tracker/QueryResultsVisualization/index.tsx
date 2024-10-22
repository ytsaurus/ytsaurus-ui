import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';
import type {QueryItem} from '../module/api';

const QueryResultsVisualizationLazy = withLazyLoading(
    React.lazy(async () => {
        return {
            default: (
                await import(
                    /* webpackChunkName: "query-results" */ './components/QueryResultsVisualization'
                )
            ).QueryResultsVisualization,
        };
    }),
);

export const QUERY_RESULT_CHART_TAB = {
    title: 'Chart',
    renderContent: (params: {query: QueryItem}) => <QueryResultsVisualizationLazy {...params} />,
};
