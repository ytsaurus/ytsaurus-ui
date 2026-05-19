import React from 'react';
import {type QueryItem} from '../../../../../types/query-tracker/api';
import {
    QueryHistoryACOCell,
    QueryHistoryActionCell,
    QueryHistoryAuthorCell,
    QueryHistoryDurationCell,
    QueryHistoryNameCell,
    QueryHistoryStartedCell,
    QueryHistoryTypeCell,
} from './ColumnCells';
import './ColumnCells.scss';

type HeaderTableItem = {header: string};
export type TableItem = QueryItem | HeaderTableItem;

export function isHeaderTableItem(b: TableItem): b is HeaderTableItem {
    return (b as HeaderTableItem).header !== undefined;
}

export type QueryHistoryListColumn = {
    name: string;
    baseWidth: number;
    render: (row: QueryItem) => React.ReactNode;
};

export const NameColumns: QueryHistoryListColumn = {
    name: 'Name',
    baseWidth: 100,
    render: (row) => {
        return <QueryHistoryNameCell row={row} />;
    },
};

export const ActionColumns: QueryHistoryListColumn = {
    name: ' ',
    baseWidth: 20,
    render: (row) => {
        return <QueryHistoryActionCell row={row} />;
    },
};

const TypeColumns: QueryHistoryListColumn = {
    name: 'Type',
    baseWidth: 60,
    render: (row) => {
        return <QueryHistoryTypeCell row={row} />;
    },
};

export const DurationColumns: QueryHistoryListColumn = {
    name: 'Duration',
    baseWidth: 100,
    render: (row) => {
        return <QueryHistoryDurationCell row={row} />;
    },
};

export const StartedColumns: QueryHistoryListColumn = {
    name: 'Started',
    baseWidth: 60,
    render: (row) => {
        return <QueryHistoryStartedCell row={row} />;
    },
};

export const AuthorColumns: QueryHistoryListColumn = {
    name: 'Author',
    baseWidth: 120,
    render: (row) => {
        return <QueryHistoryAuthorCell row={row} />;
    },
};

const ACOColumns: QueryHistoryListColumn = {
    name: 'ACO',
    baseWidth: 60,
    render: (row) => {
        return <QueryHistoryACOCell row={row} />;
    },
};

export const MyColumns: QueryHistoryListColumn[] = [
    NameColumns,
    TypeColumns,
    DurationColumns,
    StartedColumns,
    ACOColumns,
    ActionColumns,
];
export const AllColumns: QueryHistoryListColumn[] = [
    NameColumns,
    TypeColumns,
    DurationColumns,
    AuthorColumns,
    StartedColumns,
    ACOColumns,
    ActionColumns,
];
