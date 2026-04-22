import {TABLE_DEFAULTS} from '../../../constants/settings/table';
import {type RootState} from '../../reducers';
import {getSettingsInitialData} from '../../reducers/settings';
import {
    type QueryResult,
    type QueryResultReadyState,
    QueryResultState,
} from '../../../types/query-tracker/queryResult';

export const selectQueryResultsState = (state: RootState) => state.queryTracker.results;

export const selectQueryResultGlobalSettings = (): QueryResultReadyState['settings'] => {
    const settings = getSettingsInitialData();

    return {
        pageSize:
            settings['global::navigation::rowsPerTablePage'] || TABLE_DEFAULTS.rowsPerTablePage,
        cellSize:
            settings['global::navigation::maximumTableStringSize'] ||
            TABLE_DEFAULTS.maximumTableStringSize,
    };
};

export const selectQueryResults = (
    state: RootState,
    queryId: string,
): Record<number, QueryResult> | undefined => {
    const res: Record<number, QueryResult> | undefined = selectQueryResultsState(state)?.[queryId];
    return res;
};

export const selectQueryResult = (
    state: RootState,
    queryId: string,
    index: number,
): QueryResult | undefined => selectQueryResultsState(state)?.[queryId]?.[index];

export const selectQueryReadyResult = (
    state: RootState,
    queryId: string,
    index: number,
): QueryResultReadyState | undefined => {
    const result = selectQueryResult(state, queryId, index);
    if (result?.state === QueryResultState.Ready) {
        return result;
    }
    return undefined;
};

export const selectIsQueryResultReady = (state: RootState, queryId: string, index: number): boolean => {
    const result = selectQueryResult(state, queryId, index);
    return Boolean(result?.resultReady);
};

export const selectHasQueryResult = (state: RootState, queryId: string, index: number) => {
    return Boolean(selectQueryResult(state, queryId, index));
};

/* Returns the result's settings or global settings */
export const selectQueryResultSettings = (
    state: RootState,
    queryId: string,
    index: number,
): QueryResultReadyState['settings'] => {
    const result = selectQueryResult(state, queryId, index);
    if (result?.state === QueryResultState.Ready) {
        return result.settings;
    }
    return selectQueryResultGlobalSettings();
};
