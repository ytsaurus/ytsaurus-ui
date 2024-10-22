import {getSettingsDataFromInitialConfig} from '../../../../config';
import {RootState} from '../../../../store/reducers';
import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';
import {getPath} from '../../../../../shared/utils/settings';
import {QueryResult, QueryResultReadyState, QueryResultState} from './types';

export const getQueryResultsState = (state: RootState) => state.queryTracker.results;

export const getQueryResultGlobalSettings = (): QueryResultReadyState['settings'] => {
    const settings = getSettingsDataFromInitialConfig().data;
    const {ROWS_PER_TABLE_PAGE, MAXIMUM_TABLE_STRING_SIZE} = SettingName.NAVIGATION;
    const {NAVIGATION} = NAMESPACES;

    return {
        pageSize: settings[getPath(ROWS_PER_TABLE_PAGE, NAVIGATION)],
        cellSize: settings[getPath(MAXIMUM_TABLE_STRING_SIZE, NAVIGATION)],
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
