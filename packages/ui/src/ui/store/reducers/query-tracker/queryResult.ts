import {type ActionD} from '../../../types';
import {TABLE_DEFAULTS} from '../../../constants/settings/table';
import {getSettingsInitialData} from '../settings';

import {type QueryItem, type QueryItemId} from '../../../types/query-tracker/api';
import {
    type QueryResult,
    type QueryResultErrorState,
    type SourceQueryResultReadyState as QueryResultReadyState,
    QueryResultState,
    QueryResultsViewMode,
    type SourceCell,
} from '../../../types/query-tracker/queryResult';
import {
    REQUEST_QUERY_RESULTS,
    SET_QUERY_RESULTS,
    SET_QUERY_RESULTS_CELL_DATA,
    SET_QUERY_RESULTS_ERROR,
    SET_QUERY_RESULTS_ERRORS,
    SET_QUERY_RESULTS_PAGE,
    SET_QUERY_RESULTS_SETTINGS,
} from './query-tracker-contants';

export type QueryResultsState = Record<QueryItemId, Record<number, QueryResult>>;

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

export function queryResult(state = initialState, action: QueryResultsActions): QueryResultsState {
    if (
        (action.type === SET_QUERY_RESULTS ||
            action.type === SET_QUERY_RESULTS_PAGE ||
            action.type === SET_QUERY_RESULTS_ERROR) &&
        action.data.requestId !== undefined &&
        state[action.data.queryId]?.[action.data.index]?.requestId !== action.data.requestId
    ) {
        return state;
    }
    switch (action.type) {
        case REQUEST_QUERY_RESULTS: {
            const results = state[action.data.queryId] ?? {};

            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    [action.data.index]: {
                        ...results[action.data.index],
                        state: QueryResultState.Loading,
                        requestId: action.data.requestId,
                        requestOffset: action.data.rowOffset,
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
                        rowOffset: 0,
                        requestId: action.data.requestId,
                        settings: {
                            ...initialSettings,
                            ...results[action.data.index]?.settings,
                        },
                    },
                },
            };
        }
        case SET_QUERY_RESULTS_CELL_DATA: {
            const {queryId, resultIndex, rowIndex, columnName, cellData, expectedCell} =
                action.data;
            const queryResults = {...state[queryId]};
            const queryResultsTab = {...queryResults[resultIndex]};
            queryResults[resultIndex] = queryResultsTab;

            if (!queryResultsTab.resultReady) {
                return state;
            }

            const index = queryResultsTab.results.findIndex((row) => row.sourceIndex === rowIndex);
            if (
                index < 0 ||
                (expectedCell && queryResultsTab.results[index].cells[columnName] !== expectedCell)
            ) {
                return state;
            }
            const rows = [...queryResultsTab.results];
            queryResultsTab.results = rows;

            rows[index] = {...rows[index], cells: {...rows[index].cells, [columnName]: cellData}};

            return {
                ...state,
                [queryId]: queryResults,
            };
        }
        case SET_QUERY_RESULTS_PAGE: {
            const results = state[action.data.queryId] ?? {};
            const current = results[action.data.index];
            if (!current?.resultReady) return state;

            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    [action.data.index]: {
                        ...current,
                        state: QueryResultState.Ready,
                        results: action.data.results,
                        page: action.data.page,
                        rowOffset: action.data.rowOffset,
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
                        settings: results[action.data.index]?.settings,
                        requestId: action.data.requestId,
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
                        ...(results[action.data.index] ?? {state: QueryResultState.Init}),
                        settings: {
                            ...initialSettings,
                            ...results[action.data.index]?.settings,
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
        requestId?: number;
        rowOffset: number;
    }
>;

export type SetQueryResultsAction = ActionD<
    typeof SET_QUERY_RESULTS,
    {
        queryId: QueryItem['id'];
        index: number;
        requestId?: number;
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
        requestId?: number;
        results: QueryResultReadyState['results'];
        page: number;
        rowOffset: number;
    }
>;

export type SetQueryResultsErrorAction = ActionD<
    typeof SET_QUERY_RESULTS_ERROR,
    {
        queryId: QueryItem['id'];
        index: number;
        requestId?: number;
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
              cellData: SourceCell;
              expectedCell?: SourceCell;
          }
      >;
