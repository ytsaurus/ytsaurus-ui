import React, {type FC} from 'react';
import {type QueryItem} from '../../../../types/query-tracker/api';
import {QueryResultsVisualization} from './QueryResultsVisualization';

type Props = {query: QueryItem; resultIndex: number};

export const QueryResultsVisualizationWrap: FC<Props> = ({resultIndex}) => {
    return <QueryResultsVisualization resultIndex={resultIndex} />;
};
