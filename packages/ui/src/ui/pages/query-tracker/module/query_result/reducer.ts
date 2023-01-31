import {getSettingsDataFromInitialConfig} from '../../../../config';
import {SettingName, NAMESPACES} from '../../../../../shared/constants/settings';
import {getPath} from '../../../../../shared/utils/settings';
import {QueryItem} from '../api';
import {
    QueryResultsActions,
    REQUEST_QUERY_RESULTS,
    SET_QUERY_RESULTS,
    SET_QUERY_RESULTS_ERROR,
    SET_QUERY_RESULTS_PAGE,
    SET_QUERY_RESULTS_SETTINGS,
} from './actions';
import {QueryResult, QueryResultReadyState, QueryResultState, QueryResultsViewMode} from './types';

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
