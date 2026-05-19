import React, {type FC} from 'react';
import {type ListItemData} from '@gravity-ui/uikit';
import {type QueryHistoryListColumn, type TableItem, isHeaderTableItem} from '../Columns/columns';
import {QueryHistoryItemRow} from './QueryHistoryItemRow';
import {QueryHistoryHeaderRow} from './QueryHistoryHeaderRow';

type Props = {
    item: ListItemData<TableItem>;
    columns: QueryHistoryListColumn[];
};

export const HistoryListRow: FC<Props> = ({item, columns}) => {
    if (isHeaderTableItem(item)) {
        return <QueryHistoryHeaderRow header={item.header} />;
    }

    return <QueryHistoryItemRow item={item} columns={columns} />;
};
