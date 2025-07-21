import React, {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import DataTable, {Settings} from '@gravity-ui/react-data-table';
import {QueryItem} from '../../module/api';
import {refreshQueriesListIfNeeded} from '../../module/queries_list/actions';
import {
    getQueriesListTimestamp,
    getQueryListByDate,
    getQueryListColumns,
    isQueriesListLoading,
} from '../../module/queries_list/selectors';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import {useQueryNavigation} from '../../hooks/Query';
import {ListPagination} from './ListPagination';
import {useUpdater} from '../../../../hooks/use-updater';
import block from 'bem-cn-lite';

import './QueriesHistoryList.scss';
import './QueryHistoryItem.scss';

const b = block('queries-history-list');
const itemBlock = block('query-history-item');

type HeaderTableItem = {header: string};
type TableItem = QueryItem | HeaderTableItem;

const isHeaderTableItem = (item: TableItem): item is HeaderTableItem => {
    return (item as HeaderTableItem).header !== undefined;
};

const tableSettings: Settings = {
    displayIndices: false,
    sortable: false,
    stickyHead: DataTable.MOVING,
    syncHeadOnResize: true,
};

function QueriesHistoryListUpdater() {
    const dispatch = useDispatch();

    const updateFn = React.useCallback(() => {
        dispatch(refreshQueriesListIfNeeded());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: 5000});

    return null;
}

export function QueriesHistoryList() {
    const itemsByDate = useSelector(getQueryListByDate);
    const isLoading = useSelector(isQueriesListLoading);
    const {columns} = useSelector(getQueryListColumns);
    const timestamp = useSelector(getQueriesListTimestamp);
    const [selectedId, goToQuery] = useQueryNavigation();
    const scrollElemRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (scrollElemRef?.current) {
            scrollElemRef.current.scrollTop = 0;
        }
    }, [scrollElemRef, timestamp]);

    const setClassName = useCallback(
        (item: TableItem) => {
            const isHeader = isHeaderTableItem(item);
            return itemBlock({
                header: isHeader ? Boolean(item.header) : undefined,
                selected: isHeader ? undefined : item.id === selectedId,
            });
        },
        [selectedId],
    );

    return (
        <div className={b()}>
            <QueriesHistoryListUpdater />
            <div className={b('list-wrapper')} ref={scrollElemRef}>
                <DataTableYT
                    className={b('list')}
                    loading={isLoading}
                    columns={columns}
                    data={itemsByDate}
                    useThemeYT={true}
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
                    disableRightGap={true}
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
                <div className={b('pagination')}>
                    <ListPagination />
                </div>
            </div>
        </div>
    );
}
