import React, {FC} from 'react';
import {QueryItem} from '../../../../store/actions/queries/api';
import {QueryResultsVisualization} from './QueryResultsVisualization';

type Props = {query: QueryItem; resultIndex: number};

export const QueryResultsVisualizationWrap: FC<Props> = ({resultIndex}) => {
    return <QueryResultsVisualization resultIndex={resultIndex} />;
};
