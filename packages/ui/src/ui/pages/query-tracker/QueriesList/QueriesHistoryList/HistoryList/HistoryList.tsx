import React, {useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {List, type ListItemData} from '@gravity-ui/uikit';
import {
    selectHasNextPage,
    selectIsQueriesListLoading,
    selectQueryListByDate,
} from '../../../../../store/selectors/query-tracker/queriesList';
import {selectQueryListColumns} from '../Columns/selectQueryListColumns';
import {selectQuery} from '../../../../../store/selectors/query-tracker/query';
import block from 'bem-cn-lite';

import './HistoryList.scss';
import {type TableItem, isHeaderTableItem} from '../Columns/columns';
import {HistoryListHeader} from './HistoryListHeader';
import {HistoryListRow} from './HistoryListRow';
import {loadNextQueriesList} from '../../../../../store/actions/query-tracker/queriesList';
import {QueriesHistoryCursorDirection} from '../../../../../store/reducers/query-tracker/query-tracker-contants';

const b = block('yt-queries-history-list');

const LIST_ITEM_HEIGHT = 45;

export function HistoryList() {
    const dispatch = useDispatch();
    const itemsByDate = useSelector(selectQueryListByDate);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const hasNextPage = useSelector(selectHasNextPage);
    const {columns} = useSelector(selectQueryListColumns);
    const selectedId = useSelector(selectQuery)?.id;

    const items = useMemo<ListItemData<TableItem>[]>(() => {
        return itemsByDate.map((item) => {
            return isHeaderTableItem(item) ? {...item, disabled: true} : item;
        });
    }, [itemsByDate]);
    const isInitialLoading = isLoading && items.length === 0;

    const selectedItemIndex = useMemo(() => {
        return items.findIndex((item) => !isHeaderTableItem(item) && item.id === selectedId);
    }, [items, selectedId]);

    const handleLoadMore = useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    }, [dispatch]);

    return (
        <div className={b()}>
            <HistoryListHeader columns={columns} />
            <List
                className={b('list')}
                filterable={false}
                virtualized
                itemHeight={LIST_ITEM_HEIGHT}
                itemsHeight={LIST_ITEM_HEIGHT * items.length}
                items={items}
                loading={isInitialLoading || hasNextPage}
                onLoadMore={hasNextPage ? handleLoadMore : undefined}
                selectedItemIndex={selectedItemIndex}
                renderItem={(row) => {
                    return <HistoryListRow item={row} columns={columns} />;
                }}
                itemClassName={b('item')}
                itemsClassName={b('items')}
            />
        </div>
    );
}
