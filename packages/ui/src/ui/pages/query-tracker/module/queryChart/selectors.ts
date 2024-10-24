import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {getQueryResultsState} from '../query_result/selectors';
import {getQueryDraft} from '../query/selectors';
import {QueryResultReadyState} from '../query_result/types';
import {colorsValidation} from '../../QueryResultsVisualization/validation/colorsValidation';
import {lineAndBarValidation} from '../../QueryResultsVisualization/validation/lineAndBarValidation';
import {scatterValidation} from '../../QueryResultsVisualization/validation/scatterValidation';

export const selectQueryResultVisualization = (state: RootState) =>
    state.queryTracker.queryChart.visualization;

export const selectQueryResultVisualizationPlaceholders = (state: RootState) =>
    selectQueryResultVisualization(state).placeholders;

export const selectQueryResultVisualizationId = (state: RootState) =>
    selectQueryResultVisualization(state).id;

export const selectQueryResultChartSettings = (state: RootState) =>
    selectQueryResultVisualization(state).chartSettings;

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

    const columns: string[] = Object.keys(row).map((name) => {
        return name;
    });

    return columns;
};

export const resultsPlaceholdersValidation = createSelector(
    [
        selectQueryResult,
        selectQueryResultVisualizationPlaceholders,
        selectQueryResultVisualizationId,
    ],
    (queryResult, placeholders, visualizationId): Record<string, {invalid: boolean}> => {
        const hasColors = Boolean(
            placeholders.find((placeholder) => placeholder.id === 'colors')?.field,
        );

        if (hasColors) {
            return colorsValidation(queryResult, placeholders);
        }

        const validationFunction =
            visualizationId === 'scatter' ? scatterValidation : lineAndBarValidation;

        return validationFunction(queryResult, placeholders);
    },
);

export const selectIsPlaceholdersFieldsFilled = createSelector(
    [selectQueryResultVisualizationPlaceholders],
    (placeholders) => {
        return placeholders.every((item) => {
            return (item.id !== 'x' && item.id !== 'y') || item.field !== '';
        });
    },
);
