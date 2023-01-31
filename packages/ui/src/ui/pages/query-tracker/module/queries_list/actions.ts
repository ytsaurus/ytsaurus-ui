import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ActionD} from '../../../../types';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {RootState} from '../../../../store/reducers';
import {loadQueriesList, QueriesHistoryCursorDirection, QueryItem} from '../api';
import {QueriesListState} from './reducer';
import {
    getQueriesHistoryCursorParams,
    getQueriesHistoryFilterParams,
    getQueriesList,
} from './selectors';

export const LOAD_QUERIES_LIST_REQUEST = 'query-tracker/LOAD_QUERYIES_LIST_REQUEST';
export const LOAD_QUERIES_LIST_SUCCESS = 'query-tracker/LOAD_QUERYIS_LIST_SUCCESS';
export const UPDATE_QUERIES_LIST = 'query-tracker/UPDATE_QUERIES_LIST';
export const LOAD_QUERIES_LIST_ERROR = 'query-tracker/LOAD_QUERIES_LIST_ERROR';
export const SET_QUERYIES_HISTORY_FILTER = 'query-tracker/LOAD_QUERY_LIST_ERROR';
export const SET_QUERYIES_HISTORY_CURSOR = 'query-tracker/SET_QUERYIES_HISTORY_CURSOR';

export type QueriesListAction =
    | Action<typeof LOAD_QUERIES_LIST_REQUEST>
    | ActionD<
          typeof LOAD_QUERIES_LIST_SUCCESS,
          {hasMore: boolean; list: QueryItem[]; direction?: QueriesHistoryCursorDirection}
      >
    | ActionD<typeof LOAD_QUERIES_LIST_ERROR, string | Error>
    | ActionD<typeof SET_QUERYIES_HISTORY_FILTER, QueriesListState['filter']>
    | ActionD<typeof SET_QUERYIES_HISTORY_CURSOR, QueriesListState['cursor']>
    | ActionD<typeof UPDATE_QUERIES_LIST, QueryItem[]>;

export function refreshQueryHistoryListIfNeeded(
    onDone?: () => void,
): ThunkAction<any, RootState, any, QueriesListAction> {
    return async (dispatch, getState) => {
        try {
            const state = getState();
            const currentHistoryList = getQueriesList(state);
            if (currentHistoryList?.length) {
                const newQueriesResp = await loadQueriesList({
                    params: getQueriesHistoryFilterParams(state),
                    cursor: {
                        cursor_direction: QueriesHistoryCursorDirection.FUTURE,
                        cursor_time: currentHistoryList[0].start_time,
                    },
                    limit: 1,
                });
                if (newQueriesResp.queries.length) {
                    dispatch(requestQueriesList());
                }
            }
        } finally {
            onDone?.();
        }
    };
}
export function requestQueriesList(): ThunkAction<any, RootState, any, QueriesListAction> {
    return async (dispatch, getState) => {
        dispatch({type: LOAD_QUERIES_LIST_REQUEST});
        try {
            const state = getState();
            const result = await wrapApiPromiseByToaster(
                loadQueriesList({
                    params: getQueriesHistoryFilterParams(state),
                    cursor: getQueriesHistoryCursorParams(state),
                }),
                {
                    toasterName: 'load_history_list',
                    skipSuccessToast: true,
                    errorTitle: 'Failed to load queries list',
                },
            );
            dispatch({
                type: LOAD_QUERIES_LIST_SUCCESS,
                data: {
                    list: result.queries,
                    timestamp: result.timestamp,
                    hasMore: result.incomplete,
                },
            });
        } catch (e: unknown) {
            dispatch({type: LOAD_QUERIES_LIST_ERROR, data: e as Error});
        }
    };
}

export function loadNextQueriesList(
    direction = QueriesHistoryCursorDirection.PAST,
): ThunkAction<any, RootState, any, QueriesListAction> {
    return (dispatch, getState) => {
        const state = getState();
        const items = getQueriesList(state);
        if (items.length) {
            dispatch({
                type: SET_QUERYIES_HISTORY_CURSOR,
                data: {
                    cursorTime:
                        items[
                            direction === QueriesHistoryCursorDirection.FUTURE
                                ? 0
                                : items.length - 1
                        ].start_time,
                    direction,
                },
            });
            dispatch(requestQueriesList());
        }
    };
}

export function resetCursor(
    {
        silent,
    }: {
        silent?: boolean;
    } = {silent: false},
): ThunkAction<any, RootState, any, QueriesListAction> {
    return (dispatch) => {
        dispatch({
            type: SET_QUERYIES_HISTORY_CURSOR,
            data: undefined,
        });
        if (!silent) {
            dispatch(requestQueriesList());
        }
    };
}

export function applyFilter(
    patch: QueriesListState['filter'],
): ThunkAction<any, RootState, any, QueriesListAction> {
    return (dispatch) => {
        dispatch(resetCursor({silent: true}));
        dispatch({
            type: SET_QUERYIES_HISTORY_FILTER,
            data: patch,
        });
        dispatch(requestQueriesList());
    };
}
