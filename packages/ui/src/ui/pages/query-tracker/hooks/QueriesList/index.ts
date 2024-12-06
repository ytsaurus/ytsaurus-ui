import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueryItem} from '../../module/api';
import {
    getQueriesList,
    getQueriesListCursor,
    hasQueriesListMore,
    isQueriesListLoading,
} from '../../module/queries_list/selectors';
import {loadNextQueriesList, resetCursor} from '../../module/queries_list/actions';
import {setSettingByKey} from '../../../../store/actions/settings';
import {getSettingQueryTrackerQueriesListSidebarVisibilityMode} from '../../module/settings/selector';
import {QueriesHistoryCursorDirection} from '../../../../pages/query-tracker/module/query-tracker-contants';

export function useQueryList(): [QueryItem[], boolean] {
    const items = useSelector(getQueriesList);
    const isLoading = useSelector(isQueriesListLoading);

    return [items, isLoading];
}

export const useQueriesPagination = () => {
    const dispatch = useDispatch();
    const cursor = useSelector(getQueriesListCursor);
    const hasNext = useSelector(hasQueriesListMore);

    const goNext = useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    }, [dispatch]);

    const goBack = useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.FUTURE));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetCursor());
    }, [dispatch]);

    return {
        first: !cursor?.cursorTime,
        last: !hasNext,
        currentCursorTime: cursor?.cursorTime,
        goNext,
        goBack,
        goFirst: reset,
    };
};

export const useQueriesListSidebarToggle = () => {
    const dispatch = useDispatch();
    const isQueriesListSidebarVisible = useSelector(
        getSettingQueryTrackerQueriesListSidebarVisibilityMode,
    );

    const toggleQueriesListSideBarToggle = () => {
        dispatch(
            setSettingByKey(
                'global::queryTracker::queriesListSidebarVisibilityMode',
                !isQueriesListSidebarVisible,
            ),
        );
    };

    return {
        isQueriesListSidebarVisible,
        toggleQueriesListSideBarToggle,
    };
};
