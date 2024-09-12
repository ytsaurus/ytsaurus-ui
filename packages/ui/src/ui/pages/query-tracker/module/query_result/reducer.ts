import {ActionD} from '../../../../types';
import {getSettingsDataFromInitialConfig} from '../../../../config';
import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';
import {getPath} from '../../../../../shared/utils/settings';
import type {QueryItem} from '../api';
import {
    QueryResult,
    QueryResultErrorState,
    QueryResultReadyState,
    QueryResultState,
    QueryResultsViewMode,
} from './types';
import {
    REQUEST_QUERY_RESULTS,
    SET_QUERY_RESULTS,
    SET_QUERY_RESULTS_ERROR,
    SET_QUERY_RESULTS_ERRORS,
    SET_QUERY_RESULTS_PAGE,
    SET_QUERY_RESULTS_SETTINGS,
} from '../query-tracker-contants';

export interface QueryResultsState {
    [id: QueryItem['id']]: {[index: number]: QueryResult};
}

const initialState: QueryResultsState = {};

const settings = getSettingsDataFromInitialConfig().data;
const {ROWS_PER_TABLE_PAGE, MAXIMUM_TABLE_STRING_SIZE} = SettingName.NAVIGATION;
const {NAVIGATION} = NAMESPACES;

const userPageSize = settings[getPath(ROWS_PER_TABLE_PAGE, NAVIGATION)] as number | undefined;
const userCellSize = settings[getPath(MAXIMUM_TABLE_STRING_SIZE, NAVIGATION)] as number | undefined;

const initialSettings: Partial<QueryResultReadyState['settings']> = {
    viewMode: QueryResultsViewMode.Table,
    pageSize: userPageSize,
    cellSize: userCellSize,
};

export function reducer(state = initialState, action: QueryResultsActions) {
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
        case SET_QUERY_RESULTS_PAGE: {
            const results = state[action.data.queryId] ?? {};

            return {
                ...state,
                [action.data.queryId]: {
                    ...results,
                    [action.data.index]: {
                        ...results[action.data.index],
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
                        ...results[action.data.index],
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
        meta?: QueryResultReadyState['meta'];
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
    | SetQueryResultsErrorsAction;
