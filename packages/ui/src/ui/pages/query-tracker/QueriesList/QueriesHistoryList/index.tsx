import hammer from '../../../../common/hammer';
import {Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueryItem, QueryStatus} from '../../module/api';
import {UPDATE_QUERIES_LIST, refreshQueriesListIfNeeded} from '../../module/queries_list/actions';
import {getQueriesListTimestamp, getUncompletedItems} from '../../module/queries_list/selectors';
import {QueryStatusIcon} from '../../QueryStatus';

import './index.scss';
import Pagination from '../../../../components/Pagination/Pagination';
import {noop} from 'lodash';
import {QueriesPoolingContext} from '../../hooks/QueriesPooling/context';
import {formatDateCompact} from '../../../../components/common/Timeline/util';
import {QueryEnginesNames} from '../../utils/query';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import DataTable, {Column, Settings} from '@gravity-ui/react-data-table';
import {useQuriesHistoryFilter} from '../../hooks/QueryListFilter';
import {QueriesListAuthorFilter} from '../../module/queries_list/types';
import {QueryDuration} from '../../QueryDuration';
import {useQueryNavigation} from '../../hooks/Query';
import {useQueriesPagination, useQueryList} from '../../hooks/QueriesList';
import EditQueryNameModal from '../EditQueryNameModal/EditQueryNameModal';

const b = block('queries-history-list');

const itemBlock = block('query-history-item');

function useQueriesHistoryUpdate() {
    const pollingContext = useContext(QueriesPoolingContext);
    const uncompletedItems = useSelector(getUncompletedItems);
    const dispatch = useDispatch();

    const queryListUpdateHandler = useMemo(
        () => (items: QueryItem[]) => {
            dispatch({
                type: UPDATE_QUERIES_LIST,
                data: items,
            });
        },
        [dispatch],
    );

    useEffect(
        function pollingEffect() {
            if (!uncompletedItems?.length) {
                return;
            }
            pollingContext.watch(uncompletedItems, queryListUpdateHandler);
        },
        [pollingContext, queryListUpdateHandler, uncompletedItems],
    );
}

function useRefreshHistoryList(timeout = 5000) {
    // Naive history list's polling impl
    const dispatch = useDispatch();
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        function start() {
            timer = setTimeout(() => {
                dispatch(refreshQueriesListIfNeeded(start));
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

function useQueryHistoryList() {
    useRefreshHistoryList();
    useQueriesHistoryUpdate();
    return useQueryList();
}

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
                <EditQueryNameModal className={itemBlock('name-edit')} query={row} />
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
        return <QueryDuration query={row} />;
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
    const [items, isLoading] = useQueryHistoryList();

    const [filter] = useQuriesHistoryFilter();

    const timestamp = useSelector(getQueriesListTimestamp);

    const {first, last, goBack, goNext, goFirst} = useQueriesPagination();

    const [selectedId, goToQuery] = useQueryNavigation();

    const [columns, setColumns] = useState<Column<QueryItem>[]>([]);

    const scrollElemRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isLoading || !items?.length) {
            setColumns(filter.user === QueriesListAuthorFilter.My ? MyColumns : AllColumns);
        }
    }, [items, setColumns, filter.user, isLoading]);

    useEffect(() => {
        if (scrollElemRef?.current) {
            scrollElemRef.current.scrollTop = 0;
        }
    }, [scrollElemRef, timestamp]);

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
            <div className={b('list-wrapper')} ref={scrollElemRef}>
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
