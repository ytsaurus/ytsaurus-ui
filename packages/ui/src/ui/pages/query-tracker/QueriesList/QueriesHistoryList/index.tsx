import React, {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import DataTable, {Settings} from '@gravity-ui/react-data-table';
import {QueryItem} from '../../../../types/query-tracker/api';
import {
    getQueryListByDate,
    getQueryListColumns,
    hasQueriesListMore,
    isQueriesListLoading,
} from '../../../../store/selectors/query-tracker/queriesList';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import {useQueryNavigation} from '../../hooks/Query';
import {useUpdater} from '../../../../hooks/use-updater';
import block from 'bem-cn-lite';

import './QueriesHistoryList.scss';
import './QueryHistoryItem.scss';
import {
    loadNextQueriesList,
    requestQueriesList,
} from '../../../../store/actions/query-tracker/queriesList';
import {InfiniteScrollLoader} from '../../../../components/InfiniteScrollLoader';
import {QueriesHistoryCursorDirection} from '../../../../store/reducers/query-tracker/query-tracker-contants';
import {QUERY_POLLING_INTERVAL} from '../../../../constants/queries';

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
        dispatch(requestQueriesList({refresh: true}));
    }, [dispatch]);

    useUpdater(updateFn, {timeout: QUERY_POLLING_INTERVAL});

    return null;
}

export function QueriesHistoryList() {
    const dispatch = useDispatch();
    const itemsByDate = useSelector(getQueryListByDate);
    const isLoading = useSelector(isQueriesListLoading);
    const {columns} = useSelector(getQueryListColumns);
    const hasMore = useSelector(hasQueriesListMore);
    const [selectedId, goToQuery] = useQueryNavigation();

    const showPagination = hasMore && itemsByDate.length > 0;

    const handleLoadMore = () => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    };

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
            <div className={b('list-wrapper')}>
                <DataTableYT
                    className={b('list')}
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
                {showPagination && (
                    <InfiniteScrollLoader
                        className={b('pagination')}
                        loading={isLoading}
                        onLoadMore={handleLoadMore}
                    />
                )}
            </div>
        </div>
    );
}
