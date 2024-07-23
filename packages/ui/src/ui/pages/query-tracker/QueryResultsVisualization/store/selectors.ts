import {createSelector} from 'reselect';
import get_ from 'lodash/get';
import {RootState} from '../../../../store/reducers/index';
import type {QueryResult} from '../preparers/types';
import type {Placeholder, PlaceholderId} from '../types';
import objectHash from 'object-hash';

export const selectQueryResultAllVisualizations = (state: RootState) =>
    state.queryResultsVisualization.visualizations;

export const selectQueryResultVisualization = (state: RootState) =>
    state.queryResultsVisualization.visualizations[state.queryResultsVisualization.resultIndex];

export const selectQueryResultVisualizationPlaceholders = (state: RootState) =>
    selectQueryResultVisualization(state).placeholders;

export const selectQueryResultVisualizationId = (state: RootState) =>
    selectQueryResultVisualization(state).id;

export const selectQueryResultChartSettings = (state: RootState) =>
    selectQueryResultVisualization(state).chartSettings;

export const selectQueryResultIndex = (state: RootState) =>
    state.queryResultsVisualization.resultIndex;

export const selectQueryResultChartSaved = (state: RootState) =>
    state.queryResultsVisualization.saved;

export const selectQueryId = (state: RootState) => state.queryResultsVisualization.query?.id;

export const selectQueryResult = (state: RootState) =>
    state.queryResultsVisualization.queryResults[state.queryResultsVisualization.resultIndex];

export const selectAvailableFields = (state: RootState) => {
    const result = selectQueryResult(state);

    const row = (result && result[0]) || {};

    const columns: {name: string}[] = Object.keys(row).map((name) => {
        return {
            name,
        };
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
            placeholders.find((placeholder) => placeholder.id === 'colors')?.fields.length,
        );

        if (hasColors) {
            return colorsValidation(queryResult, placeholders);
        }

        const validationFunction =
            visualizationId === 'scatter' ? scatterValidation : lineAndBarValidation;

        return validationFunction(queryResult, placeholders);
    },
);

function scatterValidation(queryResult: QueryResult, placeholders: Placeholder[]) {
    const fields = placeholders.reduce(
        (ret: {x: null | string; y: null | string}, field) => {
            const fieldName = get_(field, 'fields.0.name');
            const fieldType = get_(field, 'id') as 'x' | 'y';

            if (fieldName && fieldType) {
                ret[fieldType] = fieldName;
            }

            return ret;
        },
        {x: null, y: null},
    );

    const xFieldName = fields.x;
    const yFieldName = fields.y;
    const notAllFieldsSelected = !xFieldName || !yFieldName;

    if (notAllFieldsSelected) {
        return {
            x: {invalid: false},
            y: {invalid: false},
        };
    }

    const hashes: Record<string, boolean> = {};

    const isPointsDuplicated = queryResult.some((item) => {
        const xValue = item[xFieldName].$rawValue;
        const yValue = item[yFieldName].$rawValue;
        // eslint-disable-next-line new-cap
        const hash = objectHash.MD5({
            xValue,
            yValue,
        });

        const isPointDuplicated = hashes[hash];

        hashes[hash] = true;

        return isPointDuplicated;
    });

    return {
        x: {invalid: isPointsDuplicated},
        y: {invalid: isPointsDuplicated},
    };
}

function lineAndBarValidation(queryResult: QueryResult, placeholders: Placeholder[]) {
    const fields = placeholders.reduce(
        (ret: {x: null | string; y: null | string}, field) => {
            const fieldName = get_(field, 'fields.0.name');
            const fieldType = get_(field, 'id') as 'x' | 'y';

            if (fieldName && fieldType) {
                ret[fieldType] = fieldName;
            }

            return ret;
        },
        {x: null, y: null},
    );

    const xFieldName = fields.x;
    const yFieldName = fields.y;
    const notAllFieldsSelected = !xFieldName || !yFieldName;

    if (notAllFieldsSelected) {
        return {
            x: {invalid: false},
        };
    }

    const xCoords: Record<string, boolean> = {};

    const isXCoordsDuplicated = queryResult.some((item) => {
        const xValue = item[xFieldName].$rawValue;

        const isXValueDuplicated = xCoords[xValue];

        xCoords[xValue] = true;

        return isXValueDuplicated;
    });

    return {
        x: {invalid: isXCoordsDuplicated},
    } as unknown as Record<string, {invalid: boolean}>;
}

function colorsValidation(queryResult: QueryResult, placeholders: Placeholder[]) {
    const fields = placeholders.reduce((acc: string[], field) => {
        const fieldName = get_(field, 'fields.0.name');

        if (fieldName) {
            acc.push(fieldName);
        }

        return acc;
    }, []);

    const notAllFieldsSelected = fields.length < placeholders.length;

    if (notAllFieldsSelected) {
        return {
            x: {invalid: false},
        };
    }

    const hashes: Record<string, boolean> = {};

    const isDataDuplicated = queryResult.some((item) => {
        const newObject = fields.reduce((acc: Record<string, string>, field: string) => {
            acc[field] = item[field].$rawValue;
            return acc;
        }, {});

        // eslint-disable-next-line new-cap
        const lineHash = objectHash.MD5(newObject);

        const isLineDuplicated = hashes[lineHash];

        hashes[lineHash] = true;

        return isLineDuplicated;
    });

    return {
        x: {invalid: isDataDuplicated},
    };
}

export const selectIsPlaceholdersMissSomeFields = createSelector(
    [selectQueryResultVisualizationPlaceholders],
    (placeholders) => {
        const placeholdersMap = placeholders.reduce(
            (acc, placeholder) => {
                acc[placeholder.id] = placeholder.fields.length > 0;

                return acc;
            },
            {} as Record<PlaceholderId, boolean>,
        );

        return !placeholdersMap.x || !placeholdersMap.y;
    },
);
