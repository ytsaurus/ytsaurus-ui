import React, {useMemo} from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import {List, type ListItemData} from '@gravity-ui/uikit';
import {
    selectIsQueriesListLoading,
    selectQueryListByDate,
    selectQueryListColumns,
} from '../../../../../store/selectors/query-tracker/queriesList';
import {selectQuery} from '../../../../../store/selectors/query-tracker/query';
import block from 'bem-cn-lite';

import './HistoryList.scss';
import {type TableItem, isHeaderTableItem} from '../Columns/columns';
import {HistoryListHeader} from './HistoryListHeader';
import {HistoryListRow} from './HistoryListRow';

const b = block('yt-queries-history-list');

const LIST_ITEM_HEIGHT = 45;

export function HistoryList() {
    const itemsByDate = useSelector(selectQueryListByDate);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const {columns} = useSelector(selectQueryListColumns);
    const selectedId = useSelector(selectQuery)?.id;

    const items = useMemo<ListItemData<TableItem>[]>(() => {
        return itemsByDate.map((item) => {
            return isHeaderTableItem(item) ? {...item, disabled: true} : item;
        });
    }, [itemsByDate]);

    const selectedItemIndex = useMemo(() => {
        return items.findIndex((item) => !isHeaderTableItem(item) && item.id === selectedId);
    }, [items, selectedId]);

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
                loading={isLoading && items.length === 0}
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
