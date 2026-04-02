import React from 'react';
import {type Column} from '@gravity-ui/react-data-table';
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
import block from 'bem-cn-lite';
import './ColumnCells.scss';

const columnCells = block('yt-queries-column-cells');

type HeaderTableItem = {header: string};
export type TableItem = QueryItem | HeaderTableItem;

export function isHeaderTableItem(b: TableItem): b is HeaderTableItem {
    return (b as HeaderTableItem).header !== undefined;
}

export const NameColumns: Column<TableItem> = {
    name: 'Name',
    align: 'left',

    className: columnCells('name_row'),
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return <div className={columnCells('separator')}>{row.header}</div>;
        }
        return <QueryHistoryNameCell row={row} />;
    },
};

export const ActionColumns: Column<TableItem> = {
    name: ' ',
    align: 'left',
    width: 20,
    className: columnCells('action_row'),
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }
        return <QueryHistoryActionCell row={row} />;
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
        return <QueryHistoryTypeCell row={row} />;
    },
};

export const DurationColumns: Column<TableItem> = {
    name: 'Duration',
    align: 'left',
    width: 100,
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }
        return <QueryHistoryDurationCell row={row} />;
    },
};

export const StartedColumns: Column<TableItem> = {
    name: 'Started',
    align: 'left',
    width: 60,
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }
        return <QueryHistoryStartedCell row={row} />;
    },
};

export const AuthorColumns: Column<TableItem> = {
    name: 'Author',
    align: 'left',
    width: 120,
    className: columnCells('author_row'),
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }
        return <QueryHistoryAuthorCell row={row} />;
    },
};

const ACOColumns: Column<TableItem> = {
    name: 'ACO',
    align: 'left',
    width: 60,
    className: columnCells('access_control_object'),
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }
        return <QueryHistoryACOCell row={row} />;
    },
};

export const MyColumns: Column<TableItem>[] = [
    NameColumns,
    TypeColumns,
    DurationColumns,
    StartedColumns,
    ACOColumns,
    ActionColumns,
];
export const AllColumns: Column<TableItem>[] = [
    NameColumns,
    TypeColumns,
    DurationColumns,
    AuthorColumns,
    StartedColumns,
    ACOColumns,
    ActionColumns,
];
