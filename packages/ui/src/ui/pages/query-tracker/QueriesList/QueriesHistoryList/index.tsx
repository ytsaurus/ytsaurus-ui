import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import block from 'bem-cn-lite';

import './QueriesHistoryList.scss';
import {HistoryList} from './HistoryList';
import {selectIsFullTextSearchMode} from '../../../../store/selectors/query-tracker/queriesList';
import {FullTextSearch} from './FullTextSearch';

const b = block('queries-history-list');

export function QueriesHistoryList() {
    const isFullTextSearchMode = useSelector(selectIsFullTextSearchMode);

    return <div className={b()}>{isFullTextSearchMode ? <FullTextSearch /> : <HistoryList />}</div>;
}
