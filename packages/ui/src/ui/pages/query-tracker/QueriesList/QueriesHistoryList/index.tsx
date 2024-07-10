import moment from 'moment';
import groupBy from 'lodash/groupBy';
import noop from 'lodash/noop';
import {Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import DataTable, {Column, Settings} from '@gravity-ui/react-data-table';
import {QueryItem, QueryStatus} from '../../module/api';
import {refreshQueriesListIfNeeded} from '../../module/queries_list/actions';
import {getQueriesListTimestamp, getUncompletedItems} from '../../module/queries_list/selectors';
import {QueryStatusIcon} from '../../QueryStatus';
import hammer from '../../../../common/hammer';

import Pagination from '../../../../components/Pagination/Pagination';
import {QueriesPoolingContext} from '../../hooks/QueriesPooling/context';
import {formatTime} from '../../../../components/common/Timeline/util';
import {QueryEnginesNames} from '../../utils/query';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import {useQuriesHistoryFilter} from '../../hooks/QueryListFilter';
import {QueryDuration} from '../../QueryDuration';
import {useQueryNavigation} from '../../hooks/Query';
import {useQueriesPagination, useQueryList} from '../../hooks/QueriesList';
import EditQueryNameModal from '../EditQueryNameModal/EditQueryNameModal';
import {UPDATE_QUERIES_LIST} from '../../module/query-tracker-contants';
import {useQueryHistoryListColumns} from './useQueryListColumns';

import './index.scss';

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

type HeaderTableItem = {header: string};
type TableItem = QueryItem | HeaderTableItem;

const isHeaderTableItem = (b: TableItem): b is HeaderTableItem => {
    return (b as HeaderTableItem).header !== undefined;
};

export const NameColumns: Column<TableItem> = {
    name: 'Name',
    align: 'left',
    className: itemBlock('name_row'),
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return <div className={itemBlock('separator')}>{row.header}</div>;
        }

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

const TypeColumns: Column<TableItem> = {
    name: 'Type',
    align: 'center',
    width: 60,
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }

        return (
            <Text variant="body-1" color="secondary">
                {row.engine in QueryEnginesNames ? QueryEnginesNames[row.engine] : row.engine}
            </Text>
        );
    },
};

const DurationColumns: Column<TableItem> = {
    name: 'Duration',
    align: 'left',
    width: 100,
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }

        if (row.state === QueryStatus.RUNNING) {
            return hammer.format.NO_VALUE;
        }
        return <QueryDuration query={row} />;
    },
};

const StartedColumns: Column<TableItem> = {
    name: 'Started',
    align: 'left',
    width: 60,
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }

        return (
            <Text variant="body-1" color="secondary">
                {formatTime(row.start_time)}
            </Text>
        );
    },
};

export const AuthorColumns: Column<TableItem> = {
    name: 'Author',
    align: 'left',
    width: 120,
    className: itemBlock('author_row'),
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }

        return (
            <Text variant="body-1" ellipsis title={row.user}>
                {row.user}
            </Text>
        );
    },
};

const ACOColumns: Column<TableItem> = {
    name: 'ACO',
    align: 'left',
    width: 60,
    className: itemBlock('access_control_object'),
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }

        const title = row.access_control_objects?.join(', ');

        return (
            <Text variant="body-1" ellipsis title={title}>
                {title}
            </Text>
        );
    },
};

export const MyColumns: Column<TableItem>[] = [
    NameColumns,
    TypeColumns,
    DurationColumns,
    StartedColumns,
    ACOColumns,
];
export const AllColumns: Column<TableItem>[] = [
    NameColumns,
    TypeColumns,
    DurationColumns,
    AuthorColumns,
    StartedColumns,
    ACOColumns,
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
    const {columns} = useQueryHistoryListColumns({type: filter.user});
    const timestamp = useSelector(getQueriesListTimestamp);
    const {first, last, goBack, goNext, goFirst} = useQueriesPagination();
    const [selectedId, goToQuery] = useQueryNavigation();
    const scrollElemRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (scrollElemRef?.current) {
            scrollElemRef.current.scrollTop = 0;
        }
    }, [scrollElemRef, timestamp]);

    const setClassName = useCallback(
        (item: TableItem) => {
            if (isHeaderTableItem(item)) {
                return itemBlock({
                    header: Boolean(item.header),
                });
            }

            return itemBlock({
                selected: item.id === selectedId,
            });
        },
        [selectedId],
    );

    const itemsByDate = useMemo(
        () =>
            Object.entries(
                groupBy(items, (item) => moment(item.start_time).format('DD MMMM YYYY')),
            ).reduce((ret, [header, items]) => {
                ret.push({
                    header,
                });

                return ret.concat(items.map((item) => item));
            }, [] as Array<TableItem>),
        [items],
    );

    return (
        <div className={b()}>
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
