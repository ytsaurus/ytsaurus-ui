import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

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
    renderContent: () => <QueryResultsVisualizationLazy />,
};
