import {ThunkAction} from 'redux-thunk';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {RootState} from '../../../../store/reducers';
import {loadQueriesList} from '../api';
import {getQueriesList, getQueriesListCursorParams, getQueriesListFilterParams} from './selectors';
import {QueriesListFilter} from './types';
import {QueriesHistoryCursorDirection} from '../query-tracker-contants';
import {setCursor, setFilter, setLoading, updateListState} from './queryListSlice';

type AsyncAction = ThunkAction<any, RootState, any, any>;

export function refreshQueriesListIfNeeded(onDone?: () => void): AsyncAction {
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
export function requestQueriesList(params?: {refresh?: boolean}): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(setLoading(true));
        try {
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
            dispatch(
                updateListState({
                    items: result.queries,
                    hasMore: result.incomplete,
                    timestamp: params?.refresh ? undefined : result.timestamp,
                }),
            );
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function loadNextQueriesList(direction = QueriesHistoryCursorDirection.PAST): AsyncAction {
    return (dispatch, getState) => {
        const state = getState();
        const items = getQueriesList(state);
        if (items.length) {
            dispatch(
                setCursor({
                    cursorTime:
                        items[
                            direction === QueriesHistoryCursorDirection.FUTURE
                                ? 0
                                : items.length - 1
                        ].start_time,
                    direction,
                }),
            );
            dispatch(requestQueriesList());
        }
    };
}

export function resetCursor(silent = false): AsyncAction {
    return (dispatch) => {
        dispatch(setCursor(undefined));
        if (!silent) {
            dispatch(requestQueriesList());
        }
    };
}

export function applyFilter(patch: QueriesListFilter): AsyncAction {
    return (dispatch) => {
        dispatch(resetCursor(true));
        dispatch(setFilter(patch));
        dispatch(requestQueriesList());
    };
}
