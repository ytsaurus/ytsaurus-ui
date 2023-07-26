import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ActionD} from '../../../../types';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {RootState} from '../../../../store/reducers';
import {QueriesHistoryCursorDirection, QueryItem, loadQueriesList} from '../api';
import {QueriesListState} from './reducer';
import {getQueriesList, getQueriesListCursorParams, getQueriesListFilterParams} from './selectors';
import {QueriesListCursor, QueriesListFilter} from './types';

export const LOAD_QUERIES_LIST_REQUEST = 'query-tracker/LOAD_QUERIES_LIST_REQUEST';
export const LOAD_QUERIES_LIST_SUCCESS = 'query-tracker/LOAD_QUERIES_LIST_SUCCESS';
export const UPDATE_QUERIES_LIST = 'query-tracker/UPDATE_QUERIES_LIST';
export const LOAD_QUERIES_LIST_ERROR = 'query-tracker/LOAD_QUERIES_LIST_ERROR';
export const SET_QUERIES_LIST_FILTER = 'query-tracker/SET_QUERIES_LIST_FILTER';
export const SET_QUERIES_LIST_MODE = 'query-tracker/SET_QUERIES_LIST_MODE';
export const SET_QUERIES_LIST_CURSOR = 'query-tracker/SET_QUERIES_LIST_CURSOR';

export type QueriesListAction =
    | Action<typeof LOAD_QUERIES_LIST_REQUEST>
    | ActionD<
          typeof LOAD_QUERIES_LIST_SUCCESS,
          {
              hasMore: boolean;
              list: QueryItem[];
              timestamp?: number;
              direction?: QueriesHistoryCursorDirection;
          }
      >
    | ActionD<typeof LOAD_QUERIES_LIST_ERROR, string | Error>
    | ActionD<typeof SET_QUERIES_LIST_FILTER, QueriesListFilter>
    | ActionD<
          typeof SET_QUERIES_LIST_MODE,
          {listMode: QueriesListState['listMode']; reset?: boolean}
      >
    | ActionD<typeof SET_QUERIES_LIST_CURSOR, QueriesListCursor | undefined>
    | ActionD<typeof UPDATE_QUERIES_LIST, QueryItem[]>;

export function refreshQueriesListIfNeeded(
    onDone?: () => void,
): ThunkAction<any, RootState, any, QueriesListAction> {
    return async (dispatch, getState) => {
        try {
            const state = getState();
            const list = getQueriesList(state);
            if (list?.length) {
                const newQueriesResp = await dispatch(
                    loadQueriesList({
                        params: getQueriesListFilterParams(state),
                        cursor: {
                            cursor_direction: QueriesHistoryCursorDirection.FUTURE,
                            cursor_time: list[0].start_time,
                        },
                        limit: 1,
                    }),
                );
                if (newQueriesResp.queries.length) {
                    dispatch(requestQueriesList({refresh: true}));
                }
            }
        } finally {
            onDone?.();
        }
    };
}
export function requestQueriesList(params?: {
    refresh?: boolean;
}): ThunkAction<any, RootState, any, QueriesListAction> {
    return async (dispatch, getState) => {
        dispatch({type: LOAD_QUERIES_LIST_REQUEST});
        try {
            const state = getState();
            const result = await wrapApiPromiseByToaster(
                dispatch(
                    loadQueriesList({
                        params: getQueriesListFilterParams(state),
                        cursor: getQueriesListCursorParams(state),
                    }),
                ),
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
                    timestamp: params?.refresh ? undefined : result.timestamp,
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
                type: SET_QUERIES_LIST_CURSOR,
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
            type: SET_QUERIES_LIST_CURSOR,
            data: undefined,
        });
        if (!silent) {
            dispatch(requestQueriesList());
        }
    };
}

export function applyFilter(
    patch: QueriesListFilter,
): ThunkAction<any, RootState, any, QueriesListAction> {
    return (dispatch) => {
        dispatch(resetCursor({silent: true}));
        dispatch({
            type: SET_QUERIES_LIST_FILTER,
            data: patch,
        });
        dispatch(requestQueriesList());
    };
}

export function applyListMode(
    listMode: QueriesListState['listMode'],
): ThunkAction<any, RootState, any, QueriesListAction> {
    return (dispatch) => {
        dispatch({
            type: SET_QUERIES_LIST_MODE,
            data: {
                listMode,
            },
        });
        dispatch(requestQueriesList());
    };
}
