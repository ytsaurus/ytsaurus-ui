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
import {QueryItem} from '../../../types/query-tracker/api';

type AsyncAction = ThunkAction<any, RootState, any, any>;

const QUERIES_LIST_LIMIT = 20;

export const resetQueryList =
    (silent = false): AsyncAction =>
    (dispatch) => {
        dispatch(
            updateListState({
                items: [],
                cursor: {
                    direction: QueriesHistoryCursorDirection.PAST,
                },
            }),
        );
        dispatch(requestQueriesList(silent));
    };

export function requestQueriesList(silent = false): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();
        const list = getQueriesList(state);

        if (!silent) {
            dispatch(setLoading(true));
        }

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

            const itemsMap = new Map<string, QueryItem>();
            list.forEach((item) => itemsMap.set(item.id, item));
            result.queries.forEach((item) => itemsMap.set(item.id, item));
            const items = Array.from(itemsMap.values());
            items.sort((a, b) => {
                const timeA = new Date(a.start_time).getTime();
                const timeB = new Date(b.start_time).getTime();
                return timeB - timeA;
            });
            dispatch(
                updateListState({
                    items,
                    hasMore: result.incomplete,
                    timestamp: result.timestamp,
                }),
            );
        } finally {
            if (!silent) {
                dispatch(setLoading(false));
            }
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

export function resetFilter(): AsyncAction {
    return (dispatch, getState) => {
        const state = getState();
        const listMode = getQueriesListMode(state);
        const currentFilter = getQueriesFilters(state);

        dispatch(setFilter({...DefaultQueriesListFilter[listMode], filter: currentFilter.filter}));
        dispatch(requestQueriesList());
    };
}

export function applyFilter(patch: QueriesListFilter): AsyncAction {
    return (dispatch, getState) => {
        const filter = getQueriesFilters(getState());

        dispatch(setFilter({...filter, ...patch}));
        dispatch(resetQueryList(true));
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
        dispatch(resetQueryList());
    };
}

export function updateQueryInList(queryId: string, updates: Partial<QueryItem>): AsyncAction {
    return (dispatch, getState) => {
        const state = getState();
        const items = getQueriesList(state);

        const updatedItems = items.map((item) =>
            item.id === queryId ? {...item, ...updates} : item,
        );

        dispatch(
            updateListState({
                items: updatedItems,
            }),
        );
    };
}
