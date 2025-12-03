import {createSelector} from 'reselect';
import {getQuerySingleProgress} from './query';
import {ProcessedGraph, preprocess} from '../../../pages/query-tracker/Plan/utils';

export const getProcessedGraph = createSelector(
    [getQuerySingleProgress],
    (progress): ProcessedGraph | undefined => {
        const plan = progress.yql_plan;
        return plan ? preprocess(plan) : undefined;
    },
);
