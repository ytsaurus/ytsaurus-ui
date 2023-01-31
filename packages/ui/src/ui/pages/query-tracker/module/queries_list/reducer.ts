import {QueriesHistoryCursorDirection, QueryItem} from '../api';
import {
    QueriesListAction,
    LOAD_QUERIES_LIST_ERROR,
    LOAD_QUERIES_LIST_REQUEST,
    LOAD_QUERIES_LIST_SUCCESS,
    SET_QUERYIES_HISTORY_CURSOR,
    SET_QUERYIES_HISTORY_FILTER,
    UPDATE_QUERIES_LIST,
} from './actions';
import {QueriesHistoryAuthor, QueriesHistoryFilter} from './types';

export interface QueriesListState {
    state: 'loading' | 'ready' | 'error';
    error?: string | Error;
    map: Record<QueryItem['id'], QueryItem>;
    hasMore: boolean;
    filter: QueriesHistoryFilter;
    cursor?: {
        cursorTime: string;
        direction: QueriesHistoryCursorDirection;
    };
}

const initialState: QueriesListState = {
    state: 'loading',
    error: undefined,
    map: {},
    hasMore: false,
    filter: {
        user: QueriesHistoryAuthor.My,
    },
    cursor: undefined,
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

        case SET_QUERYIES_HISTORY_FILTER: {
            return {
                ...state,
                filter: {
                    ...state.filter,
                    ...action.data,
                },
            };
        }

        case SET_QUERYIES_HISTORY_CURSOR: {
            return {
                ...state,
                cursor: action.data,
            };
        }

        default: {
            return state;
        }
    }
}
