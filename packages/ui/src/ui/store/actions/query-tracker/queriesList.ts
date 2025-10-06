import {ThunkAction} from 'redux-thunk';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {RootState} from '../../reducers';
import {loadQueriesList} from './api';
import {
    getQueriesFilters,
    getQueriesList,
    getQueriesListCursorParams,
    getQueriesListFilterParams,
    getQueriesListMode,
} from '../../selectors/query-tracker/queriesList';
import {
    DefaultQueriesListFilter,
    QueriesListFilter,
    QueriesListMode,
} from '../../../types/query-tracker/queryList';
import {QueriesHistoryCursorDirection} from '../../reducers/query-tracker/query-tracker-contants';
import {
    setCursor,
    setFilter,
    setLoading,
    updateListState,
} from '../../reducers/query-tracker/queryListSlice';

type AsyncAction = ThunkAction<any, RootState, any, any>;

const QUERIES_LIST_LIMIT = 20;

export function requestQueriesList(params?: {refresh?: boolean}): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();
        const list = getQueriesList(state);

        dispatch(setLoading(true));
        try {
            const result = await wrapApiPromiseByToaster(
                dispatch(
                    loadQueriesList({
                        params: getQueriesListFilterParams(state),
                        cursor: getQueriesListCursorParams(state),
                        limit: QUERIES_LIST_LIMIT,
                    }),
                ),
                {
                    toasterName: 'load_history_list',
                    skipSuccessToast: true,
                    errorTitle: 'Failed to load query-tracker list',
                },
            );

            const rawItems = params?.refresh ? result.queries : [...list, ...result.queries];
            const items = [...new Map(rawItems.map((item) => [item.id, item])).values()];

            dispatch(
                updateListState({
                    items,
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

        const isFuture = direction === QueriesHistoryCursorDirection.FUTURE;
        const lastItem = items[isFuture ? 0 : items.length - 1];

        if (items.length) {
            dispatch(
                setCursor({
                    cursorTime: lastItem.start_time,
                    direction,
                }),
            );
            dispatch(requestQueriesList());
        }
    };
}

export function resetCursor(silent = false): AsyncAction {
    return (dispatch) => {
        dispatch(
            setCursor({
                direction: QueriesHistoryCursorDirection.PAST,
            }),
        );
        if (!silent) {
            dispatch(requestQueriesList());
        }
    };
}

export function resetFilter(): AsyncAction {
    return (dispatch, getState) => {
        const state = getState();
        const listMode = getQueriesListMode(state);

        dispatch(setFilter({...DefaultQueriesListFilter[listMode]}));
        dispatch(requestQueriesList());
    };
}

export function applyFilter(patch: QueriesListFilter): AsyncAction {
    return (dispatch, getState) => {
        const filter = getQueriesFilters(getState());

        dispatch(resetCursor(true));
        dispatch(setFilter({...filter, ...patch}));
        dispatch(requestQueriesList({refresh: true}));
    };
}

export function applyListMode(listMode: QueriesListMode): AsyncAction {
    return (dispatch) => {
        dispatch(
            updateListState({
                listMode,
                filter: DefaultQueriesListFilter[listMode],
                cursor: {direction: QueriesHistoryCursorDirection.PAST},
                items: [],
            }),
        );
        dispatch(requestQueriesList({refresh: true}));
    };
}
