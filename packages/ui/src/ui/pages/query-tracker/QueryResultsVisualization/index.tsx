import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

const QueryResultsVisualizationLazy = withLazyLoading(
    React.lazy(async () => {
        return {
            default: (
                await import('./containers/QueryResultsVisualization/QueryResultsVisualization')
            ).QueryResultsVisualization,
        };
    }),
);

export const CUSTOM_QUERY_REQULT_TAB = {
    title: 'Chart',
    renderContent: (props: any) => <QueryResultsVisualizationLazy {...props} />,
};
