import hammer from '../../../common/hammer';
import {Label, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useHistory} from 'react-router';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueriesHistoryCursorDirection, QueryItem, QueryStatus} from '../module/api';
import {
    refreshQueryHistoryListIfNeeded,
    loadNextQueriesList,
    requestQueriesList,
    resetCursor,
    UPDATE_QUERIES_LIST,
} from '../module/queries_list/actions';
import {
    isQueriesListLoading,
    getQueriesList,
    getQueriesHistoryCursor,
    hasQueriesListMore,
    getUncompletedItems,
} from '../module/queries_list/selectors';
import {QueryStatusIcon} from '../QueryStatus';
import {queryDuration} from '../utils/date';

import './index.scss';
import {getQuery} from '../module/query/selectors';
import {QuriesHistoryListFilter} from './QueriesHistoryFilter';
import Pagination from '../../../components/Pagination/Pagination';
import {noop} from 'lodash';
import {QueriesPoolingContext} from '../hooks/QueriesPooling/context';
import {getCluster} from '../../../store/selectors/global';
import {formatDateCompact} from '../../../components/common/Timeline/util';
import {createQueryUrl} from '../utils/navigation';
import {QueryEnginesNames} from '../utils/query';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import DataTable, {Column, Settings} from '@yandex-cloud/react-data-table';
import {useQuriesHistoryFilter} from '../hooks/QueryListFilter';
import {QueriesHistoryAuthor} from '../module/queries_list/types';

const b = block('queries-history-list');

const itemBlock = block('query-history-item');

const useQueriesHistoryCursor = () => {
    const dispatch = useDispatch();
    const cursor = useSelector(getQueriesHistoryCursor);
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
        goNext,
        goBack,
        goFirst: reset,
    };
};

function useQueriesHistoryUpdate() {
    const pollingContext = useContext(QueriesPoolingContext);
    const uncompletedItems = useSelector(getUncompletedItems);
    const dispatch = useDispatch();

    useEffect(
        function pollingEffect() {
            if (!uncompletedItems?.length) {
                return;
            }
            return pollingContext.watch(uncompletedItems, (items) => {
                dispatch({
                    type: UPDATE_QUERIES_LIST,
                    data: items,
                });
            });
        },
        [uncompletedItems],
    );
}

function useRefreshHistoryList(timeout = 5000) {
    // Naive history list's polling impl
    const dispatch = useDispatch();
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        function start() {
            timer = setTimeout(() => {
                dispatch(refreshQueryHistoryListIfNeeded(start));
            }, timeout);
        }

        start();

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [timeout, dispatch]);
}

function useQueryHistoryList(): [QueryItem[], boolean] {
    const dispatch = useDispatch();
    const isLoading = useSelector(isQueriesListLoading);
    const items = useSelector(getQueriesList);
    useEffect(() => {
        dispatch(requestQueriesList());
    }, []);
    useQueriesHistoryUpdate();
    useRefreshHistoryList(5000);
    return [items, isLoading];
}

const useQueryNavigation = (): [QueryItem['id'] | undefined, (id: QueryItem) => void] => {
    const selectedItem = useSelector(getQuery);
    const cluster = useSelector(getCluster);
    const history = useHistory();

    const goToQuery = useCallback(
        (item: QueryItem) => {
            history.push(createQueryUrl(cluster, item.id));
        },
        [history],
    );

    return [selectedItem?.id, goToQuery];
};

const NameColumns: Column<QueryItem> = {
    name: 'Name',
    align: 'left',
    className: itemBlock('name_row'),
    render: ({row}) => {
        const name = row.annotations?.title;
        return (
            <div className={itemBlock('name')} title={name}>
                <QueryStatusIcon className={itemBlock('status-icon')} status={row.state} />
                <Text
                    className={itemBlock('name-container')}
                    color={name ? 'primary' : 'secondary'}
                    ellipsis
                >
                    {name || 'No name'}
                </Text>
            </div>
        );
    },
};

const TypeColumns: Column<QueryItem> = {
    name: 'Type',
    align: 'center',
    width: 60,
    render: ({row}) => {
        return (
            <Text variant="body-1" color="secondary">
                {row.engine in QueryEnginesNames ? QueryEnginesNames[row.engine] : row.engine}
            </Text>
        );
    },
};

const DurationColumns: Column<QueryItem> = {
    name: 'Duration',
    align: 'left',
    width: 100,
    render: ({row}) => {
        if (row.state === QueryStatus.RUNNING) {
            return hammer.format.NO_VALUE;
        }
        return <Label>{queryDuration(row)}</Label>;
    },
};

const StartedColumns: Column<QueryItem> = {
    name: 'Started',
    align: 'left',
    width: 120,
    render: ({row}) => {
        return (
            <Text variant="body-1" color="secondary">
                {formatDateCompact(row.start_time)}
            </Text>
        );
    },
};

const AuthorColumns: Column<QueryItem> = {
    name: 'Author',
    align: 'left',
    width: 120,
    className: itemBlock('author_row'),
    render: ({row}) => {
        return (
            <Text variant="body-1" ellipsis title={row.user}>
                {row.user}
            </Text>
        );
    },
};

const MyColumns: Column<QueryItem>[] = [NameColumns, TypeColumns, DurationColumns, StartedColumns];
const AllColumns: Column<QueryItem>[] = [
    NameColumns,
    TypeColumns,
    DurationColumns,
    AuthorColumns,
    StartedColumns,
];

const tableSettings: Settings = {
    displayIndices: false,
    sortable: false,
    stickyHead: DataTable.MOVING,
    syncHeadOnResize: true,
};

export function QueriesHistoryList() {
    // const mainLocation = useParams();
    const [items, isLoading] = useQueryHistoryList();

    const [filter, setFilter] = useQuriesHistoryFilter();

    const {first, last, goBack, goNext, goFirst} = useQueriesHistoryCursor();

    const [selectedId, goToQuery] = useQueryNavigation();

    const [columns, setColumns] = useState<Column<QueryItem>[]>([]);

    useEffect(() => {
        if (!isLoading || !items?.length) {
            setColumns(filter.user === QueriesHistoryAuthor.My ? MyColumns : AllColumns);
        }
    }, [items, setColumns, filter.user, isLoading]);

    const setClassName = useCallback(
        (item: QueryItem) => {
            return itemBlock({
                selected: item.id === selectedId,
            });
        },
        [selectedId],
    );

    return (
        <div className={b()}>
            <QuriesHistoryListFilter className={b('filter')} filter={filter} onChange={setFilter} />
            <div className={b('list-wrapper')}>
                <DataTableYT
                    className={b('list')}
                    loading={isLoading}
                    columns={columns}
                    data={items}
                    useThemeYT={true}
                    rowKey={(row) => row.id}
                    onRowClick={goToQuery}
                    disableRightGap={true}
                    settings={tableSettings}
                    rowClassName={setClassName}
                />
                <div className={b('pagination')}>
                    {(!first || !last) && (
                        <Pagination
                            size="m"
                            first={{
                                handler: goFirst,
                                disabled: first,
                            }}
                            previous={{
                                handler: goBack,
                                disabled: first,
                            }}
                            next={{
                                handler: goNext,
                                disabled: last,
                            }}
                            last={{
                                handler: noop,
                                disabled: true,
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
