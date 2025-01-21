import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {getQueryResultsState} from '../query_result/selectors';
import {getQueryDraft} from '../query/selectors';
import {QueryResultReadyState} from '../query_result/types';
import {NumberTypes} from '../../QueryResultsVisualization/preparers/getPointData';

export const selectChartVisualization = (state: RootState) =>
    state.queryTracker.queryChart.visualization;

export const selectChartConfig = (state: RootState) =>
    state.queryTracker.queryChart.visualization.config;

export const selectChartAxisType = createSelector(
    [selectChartConfig],
    (config) => config.xAxis.type,
);

export const selectQueryResultChartSaved = (state: RootState) =>
    state.queryTracker.queryChart.saved;

export const selectQueryResult = createSelector(
    [getQueryDraft, getQueryResultsState],
    (draft, results) => {
        const {id} = draft;

        if (!id || !(id in results)) return [];

        return (results[id][0] as QueryResultReadyState).results;
    },
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
