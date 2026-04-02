import React from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {useUpdater} from '../../../../hooks/use-updater';
import block from 'bem-cn-lite';

import './QueriesHistoryList.scss';
import {
    loadNextQueriesList,
    requestQueriesList,
} from '../../../../store/actions/query-tracker/queriesList';
import {QUERY_POLLING_INTERVAL} from '../../../../constants/queries';
import {HistoryList} from './HistoryList';
import {
    selectIsFullTextSearchMode,
    selectIsQueriesListLoading,
    selectPaginationIsVisible,
} from '../../../../store/selectors/query-tracker/queriesList';
import {FullTextSearch} from './FullTextSearch';
import {InfiniteScrollLoader} from '../../../../components/InfiniteScrollLoader';
import {QueriesHistoryCursorDirection} from '../../../../store/reducers/query-tracker/query-tracker-contants';

const b = block('queries-history-list');

function QueriesHistoryListUpdater() {
    const dispatch = useDispatch();

    const updateFn = React.useCallback(() => {
        dispatch(requestQueriesList(true));
    }, [dispatch]);

    useUpdater(updateFn, {timeout: QUERY_POLLING_INTERVAL});

    return null;
}

export function QueriesHistoryList() {
    const dispatch = useDispatch();
    const isLoading = useSelector(selectIsQueriesListLoading);
    const isFullTextSearchMode = useSelector(selectIsFullTextSearchMode);
    const showPagination = useSelector(selectPaginationIsVisible);

    const handleLoadMore = () => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    };

    return (
        <div className={b()}>
            <QueriesHistoryListUpdater />
            {isFullTextSearchMode ? <FullTextSearch /> : <HistoryList />}
            {showPagination && (
                <InfiniteScrollLoader
                    className={b('pagination')}
                    loading={isLoading}
                    onLoadMore={handleLoadMore}
                />
            )}
        </div>
    );
}
