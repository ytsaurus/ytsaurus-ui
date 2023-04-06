import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueriesHistoryCursorDirection, QueryItem} from '../../module/api';
import {
    isQueriesListLoading,
    getQueriesList,
    getQueriesListCursor,
    hasQueriesListMore,
} from '../../module/queries_list/selectors';
import {loadNextQueriesList, resetCursor} from '../../module/queries_list/actions';

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
