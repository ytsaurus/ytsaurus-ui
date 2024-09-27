import React from 'react';
import {QueryResultsVisualization} from './containers/QueryResultsVisualization/QueryResultsVisualization';

export const CUSTOM_QUERY_REQULT_TAB = {
    title: 'Chart',
    renderContent: (props: any) => <QueryResultsVisualization {...props} />,
};
