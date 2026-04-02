import React, {useCallback} from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import DataTable, {type Settings} from '@gravity-ui/react-data-table';
import {
    selectIsQueriesListLoading,
    selectQueryListByDate,
    selectQueryListColumns,
} from '../../../../store/selectors/query-tracker/queriesList';
import {DataTableYT} from '@ytsaurus/components';
import {useQueryNavigation} from '../../hooks/Query';
import block from 'bem-cn-lite';

import './HistoryList.scss';
import {type TableItem, isHeaderTableItem} from './Columns/columns';

const b = block('yt-queries-history-list');

const tableSettings: Settings = {
    displayIndices: false,
    sortable: false,
    stickyHead: DataTable.MOVING,
    syncHeadOnResize: true,
};

export function HistoryList() {
    const itemsByDate = useSelector(selectQueryListByDate);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const {columns} = useSelector(selectQueryListColumns);
    const [selectedId, goToQuery] = useQueryNavigation();

    const setClassName = useCallback(
        (item: TableItem) => {
            const isHeader = isHeaderTableItem(item);
            return b('item', {
                header: isHeader ? Boolean(item.header) : undefined,
                selected: isHeader ? undefined : item.id === selectedId,
            });
        },
        [selectedId],
    );

    return (
        <DataTableYT
            className={b()}
            loading={isLoading}
            columns={columns}
            data={itemsByDate}
            useThemeYT
            rowKey={(row) => {
                if (isHeaderTableItem(row)) {
                    return row.header;
                }

                return row.id;
            }}
            onRowClick={(item) => {
                if (!isHeaderTableItem(item)) {
                    goToQuery(item);
                }
            }}
            disableRightGap
            settings={tableSettings}
            rowClassName={setClassName}
            getColSpansOfRow={({row}) => {
                if (isHeaderTableItem(row)) {
                    return {
                        Name: columns.length,
                    };
                }

                return undefined;
            }}
        />
    );
}
