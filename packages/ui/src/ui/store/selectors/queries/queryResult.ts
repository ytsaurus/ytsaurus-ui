import {TABLE_DEFAULTS} from '../../../constants/settings/table';
import {RootState} from '../../reducers';
import {getSettingsInitialData} from '../../reducers/settings';
import {
    QueryResult,
    QueryResultReadyState,
    QueryResultState,
} from '../../../types/query-tracker/queryResult';

export const getQueryResultsState = (state: RootState) => state.queryTracker.results;

export const getQueryResultGlobalSettings = (): QueryResultReadyState['settings'] => {
    const settings = getSettingsInitialData();

    return {
        pageSize:
            settings['global::navigation::rowsPerTablePage'] || TABLE_DEFAULTS.rowsPerTablePage,
        cellSize:
            settings['global::navigation::maximumTableStringSize'] ||
            TABLE_DEFAULTS.maximumTableStringSize,
    };
};

export const getQueryResults = (
    state: RootState,
    queryId: string,
): Record<number, QueryResult> | undefined => {
    const res: Record<number, QueryResult> | undefined = getQueryResultsState(state)?.[queryId];
    return res;
};

export const getQueryResult = (
    state: RootState,
    queryId: string,
    index: number,
): QueryResult | undefined => getQueryResultsState(state)?.[queryId]?.[index];

export const getQueryReadyResult = (
    state: RootState,
    queryId: string,
    index: number,
): QueryResultReadyState | undefined => {
    const result = getQueryResult(state, queryId, index);
    if (result?.state === QueryResultState.Ready) {
        return result;
    }
    return undefined;
};

export const isQueryResultReady = (state: RootState, queryId: string, index: number): boolean => {
    const result = getQueryResult(state, queryId, index);
    return Boolean(result?.resultReady);
};

export const hasQueryResult = (state: RootState, queryId: string, index: number) => {
    return Boolean(getQueryResult(state, queryId, index));
};

/* Returns the result's settings or global settings */
export const getQueryResultSettings = (
    state: RootState,
    queryId: string,
    index: number,
): QueryResultReadyState['settings'] => {
    const result = getQueryResult(state, queryId, index);
    if (result?.state === QueryResultState.Ready) {
        return result.settings;
    }
    return getQueryResultGlobalSettings();
};
