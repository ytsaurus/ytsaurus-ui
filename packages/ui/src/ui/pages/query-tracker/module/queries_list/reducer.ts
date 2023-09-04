import {QueryItem} from '../api';
import {
    LOAD_QUERIES_LIST_ERROR,
    LOAD_QUERIES_LIST_REQUEST,
    LOAD_QUERIES_LIST_SUCCESS,
    QueriesListAction,
    SET_QUERIES_LIST_CURSOR,
    SET_QUERIES_LIST_FILTER,
    SET_QUERIES_LIST_MODE,
} from './actions';
import {
    DefaultQueriesListFilter,
    QueriesListCursor,
    QueriesListFilter,
    QueriesListMode,
} from './types';
import {UPDATE_QUERIES_LIST} from '../query-tracker-contants';

export interface QueriesListState {
    state: 'loading' | 'ready' | 'error';
    error?: string | Error;
    map: Record<QueryItem['id'], QueryItem>;
    hasMore: boolean;
    timestamp: number; // Determines is the list is changed(by filter or cursor).
    filter: Partial<
        Record<
            QueriesListMode,
            {
                filter: QueriesListFilter;
                cursor?: QueriesListCursor;
            }
        >
    >;
    listMode: QueriesListMode;
}

const initialState: QueriesListState = {
    state: 'loading',
    error: undefined,
    map: {},
    hasMore: false,
    timestamp: 0,
    filter: {
        [QueriesListMode.History]: {
            filter: DefaultQueriesListFilter[QueriesListMode.History],
            cursor: undefined,
        },
    },
    listMode: QueriesListMode.History,
};

export function reducer(state = initialState, action: QueriesListAction): QueriesListState {
    switch (action.type) {
        case LOAD_QUERIES_LIST_REQUEST: {
            return {...state, state: 'loading'};
        }

        case LOAD_QUERIES_LIST_SUCCESS: {
            return {
                ...state,
                state: 'ready',
                error: undefined,
                map: action.data.list.reduce(
                    (acc: Record<QueryItem['id'], QueryItem>, item: QueryItem) => {
                        acc[item.id] = item;
                        return acc;
                    },
                    {},
                ),
                timestamp: action.data.timestamp || state.timestamp,
                hasMore: action.data.hasMore,
            };
        }

        /**
         * TODO:
         * Updated items may not satisfiy a filter's criteria
         * So better to update whole list, but this is expensive
         *  */
        case UPDATE_QUERIES_LIST: {
            return {
                ...state,
                map: action.data.reduce(
                    (acc: Record<QueryItem['id'], QueryItem>, item: QueryItem) => {
                        acc[item.id] = item;
                        return acc;
                    },
                    {...state.map},
                ),
            };
        }

        case LOAD_QUERIES_LIST_ERROR: {
            return {
                ...state,
                state: 'ready',
                error: action.data,
            };
        }

        case SET_QUERIES_LIST_FILTER: {
            const listMode = state.listMode;
            return {
                ...state,
                listMode,
                filter: {
                    ...state.filter,
                    [listMode]: {
                        ...state.filter[listMode],
                        filter: {...state.filter[listMode]?.filter, ...action.data},
                    },
                },
            };
        }

        case SET_QUERIES_LIST_MODE: {
            const listMode = action.data.listMode;
            return {
                ...state,
                listMode,
                filter: {
                    ...state.filter,
                    [listMode]: {
                        ...state.filter[listMode],
                        filter: {
                            ...(action.data.reset
                                ? DefaultQueriesListFilter[listMode]
                                : state.filter[listMode]?.filter),
                        },
                    },
                },
            };
        }

        case SET_QUERIES_LIST_CURSOR: {
            const listMode = state.listMode;
            return {
                ...state,
                filter: {
                    ...state.filter,
                    [listMode]: {
                        ...state.filter[listMode],
                        cursor: action.data,
                    },
                },
            };
        }

        default: {
            return state;
        }
    }
}
