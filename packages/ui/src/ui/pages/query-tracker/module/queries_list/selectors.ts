import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {getCurrentUserName} from '../../../../store/selectors/global';
import {QueriesListParams} from '../api';
import {isQueryProgress} from '../../utils/query';
import {QueriesListFilterPresets} from './types';

export const getQueriesListState = (state: RootState) => state.queryTracker.list;

export const isQueriesListLoading = (state: RootState) =>
    getQueriesListState(state).state === 'loading';

export const getQueriesListMap = (state: RootState) => getQueriesListState(state).map;

export const getQueriesListTimestamp = (state: RootState) => getQueriesListState(state).timestamp;

export const getQueriesList = createSelector(getQueriesListMap, (map) => {
    return Object.values(map);
});
export const hasQueriesListMore = (state: RootState) => getQueriesListState(state).hasMore;

export const getQueriesListError = (state: RootState) => getQueriesListState(state).error;

export const getQueriesFilters = (state: RootState) => getQueriesListState(state).filter;
export const getQueriesListMode = (state: RootState) => getQueriesListState(state).listMode;

export const getQueriesListFilter = createSelector(
    [getQueriesFilters, getQueriesListMode],
    (filters, listMode) => {
        return filters[listMode]?.filter || {};
    },
);

export const getQueriesListCursor = createSelector(
    [getQueriesFilters, getQueriesListMode],
    (filters, listMode) => {
        return filters[listMode]?.cursor;
    },
);

export const getUncompletedItems = createSelector(getQueriesList, (items) => {
    return items.filter(isQueryProgress);
});

export const getQueriesListCursorParams = (state: RootState) => {
    const cursor = getQueriesListCursor(state);
    if (cursor) {
        return {cursor_time: cursor.cursorTime, cursor_direction: cursor.direction};
    }

    return undefined;
};

export function getQueriesListFilterParams(state: RootState): QueriesListParams {
    const listMode = getQueriesListMode(state);
    const filterParams = {
        ...getQueriesListFilter(state),
        ...(QueriesListFilterPresets[listMode] || {}),
    };
    const {is_tutorial, ...filter} = filterParams;
    if (is_tutorial) {
        filter.filter = `is_tutorial`;
    }
    if (filter.user === 'my') {
        const user = getCurrentUserName(state);
        if (user) {
            return {
                ...filter,
                user,
            };
        }
    }
    return {
        ...filter,
        user: undefined,
    };
}
