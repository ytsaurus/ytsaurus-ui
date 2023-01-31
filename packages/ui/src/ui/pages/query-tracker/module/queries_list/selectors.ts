import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {getCurrentUserName} from '../../../../store/selectors/global';
import {QueriesListParams} from '../api';
import {isQueryProgress} from '../../utils/query';

export const getQueriesHistoryState = (state: RootState) => state.queryTracker.list;

export const isQueriesListLoading = (state: RootState) =>
    getQueriesHistoryState(state).state === 'loading';

const getQueriesHistoryMap = (state: RootState) => getQueriesHistoryState(state).map;

export const getQueriesList = createSelector(getQueriesHistoryMap, (map) => {
    return Object.values(map);
});
export const hasQueriesListMore = (state: RootState) => getQueriesHistoryState(state).hasMore;

export const getQueriesListError = (state: RootState) => getQueriesHistoryState(state).error;

export const getQueriesHistoryFilter = (state: RootState) => getQueriesHistoryState(state).filter;

export const getQueriesHistoryCursor = (state: RootState) => getQueriesHistoryState(state).cursor;

export const getUncompletedItems = createSelector(getQueriesList, (items) => {
    return items.filter(isQueryProgress);
});

export const getQueriesHistoryCursorParams = (state: RootState) => {
    const cursor = getQueriesHistoryCursor(state);
    if (cursor) {
        return {cursor_time: cursor.cursorTime, cursor_direction: cursor.direction};
    }

    return undefined;
};

export function getQueriesHistoryFilterParams(state: RootState): QueriesListParams {
    const filter = getQueriesHistoryFilter(state);
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
