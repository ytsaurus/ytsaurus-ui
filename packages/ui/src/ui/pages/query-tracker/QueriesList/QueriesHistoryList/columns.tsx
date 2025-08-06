import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import hammer from '../../../../common/hammer';
import {QueryStatusIcon} from '../../../../components/QueryStatus';
import {formatTime} from '../../../../components/common/Timeline/util';
import {QueryEnginesNames} from '../../utils/query';
import {QueryItem} from '../../module/api';
import EditQueryNameModal from '../EditQueryNameModal/EditQueryNameModal';
import {QueryStatus} from '../../../../types/query-tracker';
import {QueryDuration} from '../../QueryDuration';
import './QueryHistoryItem.scss';

const itemBlock = block('query-history-item');

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
            </div>
        );
    },
};

export const ActionColumns: Column<TableItem> = {
    name: ' ',
    align: 'left',
    width: 20,
    className: itemBlock('action_row'),
    render: ({row}) => {
        if (isHeaderTableItem(row)) {
            return null;
        }

        return (
            <div className={itemBlock('action')} onClick={(e) => e.stopPropagation()}>
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
