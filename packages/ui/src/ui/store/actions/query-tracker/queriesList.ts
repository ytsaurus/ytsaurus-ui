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
import CancelHelper from '../../../utils/cancel-helper';

type AsyncAction = ThunkAction<any, RootState, any, any>;

const QUERIES_LIST_LIMIT = 20;

function compareQueriesByStartTime(a: QueryItem, b: QueryItem): number {
    const timeA = new Date(a.start_time).getTime();
    const timeB = new Date(b.start_time).getTime();
    return timeB - timeA;
}

export function requestQueriesList(params?: {
    refresh?: boolean;
    cancelToken?: CancelHelper;
}): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();
        const list = getQueriesList(state);

        dispatch(setLoading(true));
        try {
            const result = await wrapApiPromiseByToaster(
                dispatch(
                    loadQueriesList(
                        {
                            params: getQueriesListFilterParams(state),
                            cursor: params?.refresh ? undefined : getQueriesListCursorParams(state),
                            limit: QUERIES_LIST_LIMIT,
                        },
                        params?.cancelToken,
                    ),
                ),
                {
                    toasterName: 'load_history_list',
                    skipSuccessToast: true,
                    errorTitle: 'Failed to load query-tracker list',
                },
            );

            let items: QueryItem[];
            if (params?.refresh) {
                items = [...result.queries].sort(compareQueriesByStartTime);

                dispatch(
                    updateListState({
                        items,
                        hasMore: result.incomplete,
                        timestamp: result.timestamp,
                        cursor: {direction: QueriesHistoryCursorDirection.PAST},
                    }),
                );
            } else {
                const itemsMap = new Map<string, QueryItem>();
                list.forEach((item) => itemsMap.set(item.id, item));
                result.queries.forEach((item) => itemsMap.set(item.id, item));
                items = Array.from(itemsMap.values());
                items.sort(compareQueriesByStartTime);
                dispatch(
                    updateListState({
                        items,
                        hasMore: result.incomplete,
                        timestamp: result.timestamp,
                    }),
                );
            }
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
