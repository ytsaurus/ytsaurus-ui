import {createSelector} from 'reselect';
import {type RootState} from '../../reducers';
import {selectQueryResultsState} from './queryResult';
import {selectQueryDraft} from './query';
import {prepareLegacyRows} from '../../../utils/query-tracker/resultRows';
import {NumberTypes} from '../../../types/query-tracker/yqlTypes';

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
    [selectQueryDraft, selectQueryResultsState],
    ({id}, results) => {
        if (!id || !(id in results)) return [];

        return results[id];
    },
);

export const selectQueryResult = createSelector(
    [selectQueryResults, selectChartResultIndex],
    (results, index) => {
        if (!(index in results)) return [];

        const result = results[index];
        return result?.resultReady ? prepareLegacyRows(result.results) : [];
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
