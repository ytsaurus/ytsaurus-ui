import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';
import type {QueryItem} from '../../../types/query-tracker/api';

const QueryResultsVisualizationLazy = withLazyLoading(
    React.lazy(async () => {
        return {
            default: (
                await import(
                    /* webpackChunkName: "query-visualization" */ './components/QueryResultsVisualizationWrap'
                )
            ).QueryResultsVisualizationWrap,
        };
    }),
);

export const QUERY_RESULT_CHART_TAB = {
    renderContent: (props: {query: QueryItem; resultIndex: number}) => (
        <QueryResultsVisualizationLazy {...props} />
    ),
};
