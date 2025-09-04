import {ActionD} from '../../../../types';
import {TABLE_DEFAULTS} from '../../../../constants/settings/table';
import {getSettingsInitialData} from '../../../../store/reducers/settings';

import type {QueryItem, QueryItemId} from '../api';
import {
    QueryResult,
    QueryResultErrorState,
    QueryResultLoadingState,
    QueryResultReadyState,
    QueryResultState,
    QueryResultsViewMode,
} from './types';
import {
    REQUEST_QUERY_RESULTS,
    SET_QUERY_RESULTS,
    SET_QUERY_RESULTS_CELL_DATA,
    SET_QUERY_RESULTS_ERROR,
    SET_QUERY_RESULTS_ERRORS,
    SET_QUERY_RESULTS_PAGE,
    SET_QUERY_RESULTS_SETTINGS,
} from '../query-tracker-contants';

export type QueryResultsState = Record<QueryItemId, QueryResult[]>;

const initialState: QueryResultsState = {};

const settings = getSettingsInitialData();

const userPageSize =
    settings['global::navigation::rowsPerTablePage'] || TABLE_DEFAULTS.rowsPerTablePage;
const userCellSize =
    settings['global::navigation::maximumTableStringSize'] || TABLE_DEFAULTS.maximumTableStringSize;

const initialSettings: QueryResultReadyState['settings'] = {
    viewMode: QueryResultsViewMode.Table,
    pageSize: userPageSize,
    cellSize: userCellSize,
};

export function reducer(state = initialState, action: QueryResultsActions): QueryResultsState {
    switch (action.type) {
        case REQUEST_QUERY_RESULTS: {
            const results = state[action.data.queryId] ?? {};

            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    [action.data.index]: {
                        ...(results[action.data.index] as QueryResultLoadingState),
                        state: QueryResultState.Loading,
                    },
                },
            };
        }
        case SET_QUERY_RESULTS: {
            const results = state[action.data.queryId] ?? {};

            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    [action.data.index]: {
                        resultReady: true,
                        state: QueryResultState.Ready,
                        columns: action.data.columns,
                        results: action.data.results,
                        meta: action.data.meta,
                        page: 0,
                        settings: {
                            ...initialSettings,
                        },
                    },
                },
            };
        }
        case SET_QUERY_RESULTS_CELL_DATA: {
            const {queryId, resultIndex, rowIndex, columnName, cellData} = action.data;
            const queryResults = {...state[queryId]};
            const queryResultsTab = {...queryResults[resultIndex]};
            queryResults[resultIndex] = queryResultsTab;

            if (!queryResultsTab.resultReady) {
                return state;
            }

            const rows = [...queryResultsTab.results];
            queryResultsTab.results = rows;

            const rowData = {...rows[rowIndex], [columnName]: cellData};
            rows[rowIndex] = rowData;

            return {
                ...state,
                [queryId]: queryResults,
            };
        }
        case SET_QUERY_RESULTS_PAGE: {
            const results = state[action.data.queryId] ?? {};

            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    [action.data.index]: {
                        ...(results[action.data.index] as QueryResultReadyState),
                        state: QueryResultState.Ready,
                        results: action.data.results,
                        page: action.data.page,
                    },
                },
            };
        }
        case SET_QUERY_RESULTS_ERROR: {
            const results = state[action.data.queryId] ?? {};
            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    [action.data.index]: {
                        state: QueryResultState.Error,
                        error: action.data.error,
                    },
                },
            };
        }
        case SET_QUERY_RESULTS_ERRORS: {
            const results = state[action.data.queryId] ?? {};
            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    ...action.data.errors,
                },
            };
        }
        case SET_QUERY_RESULTS_SETTINGS: {
            const results = state[action.data.queryId] ?? {};
            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    [action.data.index]: {
                        ...(results[action.data.index] as QueryResultReadyState),
                        settings: {
                            ...(results[action.data.index] as QueryResultReadyState).settings,
                            ...action.data.settings,
                        },
                    },
                },
            };
        }
    }
    return state;
}

export type RequestQueryResultsAction = ActionD<
    typeof REQUEST_QUERY_RESULTS,
    {
        queryId: QueryItem['id'];
        index: number;
    }
>;

export type SetQueryResultsAction = ActionD<
    typeof SET_QUERY_RESULTS,
    {
        queryId: QueryItem['id'];
        index: number;
        results: QueryResultReadyState['results'];
        columns: QueryResultReadyState['columns'];
        meta: QueryResultReadyState['meta'];
    }
>;

export type SetQueryResultsPageAction = ActionD<
    typeof SET_QUERY_RESULTS_PAGE,
    {
        queryId: QueryItem['id'];
        index: number;
        results: QueryResultReadyState['results'];
        page: number;
    }
>;

export type SetQueryResultsErrorAction = ActionD<
    typeof SET_QUERY_RESULTS_ERROR,
    {
        queryId: QueryItem['id'];
        index: number;
        error: Error;
    }
>;

export type SetQueryResultsErrorsAction = ActionD<
    typeof SET_QUERY_RESULTS_ERRORS,
    {queryId: QueryItem['id']; errors: {[index: number]: QueryResultErrorState}}
>;

export type SetQueryResultsSettingsAction = ActionD<
    typeof SET_QUERY_RESULTS_SETTINGS,
    {
        queryId: QueryItem['id'];
        index: number;
        settings: Partial<QueryResultReadyState['settings']>;
    }
>;

export type QueryResultsActions =
    | RequestQueryResultsAction
    | SetQueryResultsAction
    | SetQueryResultsErrorAction
    | SetQueryResultsSettingsAction
    | SetQueryResultsPageAction
    | SetQueryResultsErrorsAction
    | ActionD<
          typeof SET_QUERY_RESULTS_CELL_DATA,
          {
              queryId: string;
              resultIndex: number;
              rowIndex: number;
              columnName: string;
              cellData: QueryResultReadyState['results'][number][string];
          }
      >;
