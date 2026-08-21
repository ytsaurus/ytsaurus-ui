import React from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {useUpdater} from '../../../../hooks/use-updater';
import block from 'bem-cn-lite';

import './QueriesHistoryList.scss';
import {requestQueriesList} from '../../../../store/actions/query-tracker/queriesList';
import {QUERY_POLLING_INTERVAL} from '../../../../constants/queries';
import {HistoryList} from './HistoryList';
import {selectIsFullTextSearchMode} from '../../../../store/selectors/query-tracker/queriesList';
import {FullTextSearch} from './FullTextSearch';

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
    const isFullTextSearchMode = useSelector(selectIsFullTextSearchMode);

    return (
        <div className={b()}>
            <QueriesHistoryListUpdater />
            {isFullTextSearchMode ? <FullTextSearch /> : <HistoryList />}
        </div>
    );
}
