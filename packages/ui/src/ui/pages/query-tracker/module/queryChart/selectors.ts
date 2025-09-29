import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {getQueryResultsState} from '../query_result/selectors';
import {getQueryDraft} from '../query/selectors';
import {QueryResultReadyState} from '../query_result/types';
import {NumberTypes} from './constants/yqlTypes';

export const selectChartVisualization = (state: RootState) =>
    state.queryTracker.queryChart.visualization;

export const selectChartResultIndex = (state: RootState) =>
    state.queryTracker.queryChart.resultIndex;

export const selectChartLoading = (state: RootState) => state.queryTracker.queryChart.loading;

export const selectCurrentChartVisualization = createSelector(
    [selectChartVisualization, selectChartResultIndex],
    (visualization, resultIndex) => visualization[resultIndex],
);

export const selectQueryResults = createSelector(
    [getQueryDraft, getQueryResultsState],
    ({id}, results) => {
        if (!id || !(id in results)) return [];

        return results[id];
    },
);

export const selectQueryResult = createSelector(
    [selectQueryResults, selectChartResultIndex],
    (results, index) => {
        if (!(index in results)) return [];

        return (results[index] as QueryResultReadyState).results;
    },
);

export const selectChartConfig = createSelector(
    [selectCurrentChartVisualization],
    (visualization) => visualization?.config,
);

export const selectChartAxisType = createSelector(
    [selectChartConfig],
    (config) => config.xAxis.type,
);

export const selectAvailableFields = (state: RootState) => {
    const result = selectQueryResult(state);

    const row = (result && result[0]) || [];

    return Object.keys(row).reduce<{stringColumns: string[]; numberColumns: string[]}>(
        (acc, key) => {
            if (NumberTypes.includes(row[key].$type)) {
                acc['numberColumns'].push(key);
            } else {
                acc['stringColumns'].push(key);
            }

            return acc;
        },
        {stringColumns: [], numberColumns: []},
    );
};
