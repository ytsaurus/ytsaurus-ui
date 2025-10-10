import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import type {ColumnDef} from '@gravity-ui/table/tanstack';

import ColumnHeader from '../../../../../../components/ColumnHeader/ColumnHeader';
import {DataTableGravity, useTable} from '../../../../../../components/DataTableGravity';
import {getSchedulingOverviewTableItems} from '../../../../../../store/selectors/scheduling/scheduling';
import {getSchedulingOperationsLoadingStatus} from '../../../../../../store/selectors/scheduling/expanded-pools';

import './SchedulingTable.scss';

import i18n from './i18n';
import {NameCell} from './NameCell';

const block = cn('yt-scheduling-table');

export type RowData = ReturnType<typeof getSchedulingOverviewTableItems>[number];

export function SchedulingTable() {
    const items = useSelector(getSchedulingOverviewTableItems);
    const columns = useSchedulingTableColumns();

    const table = useTable({columns, data: items});

    return <DataTableGravity className={block()} table={table} />;
}

export function useSchedulingTableColumns() {
    const loading = useSelector(getSchedulingOperationsLoadingStatus);

    const columns: Array<ColumnDef<RowData>> = [
        {
            id: 'name',
            header: () => <ColumnHeader column={i18n('pool-operation')} loading={loading} />,
            cell: ({row}) => {
                return <NameCell row={row.original} />;
            },
        },
        {
            id: 'actions',
            cell: () => {
                return '...';
            },
        },
    ];
    return columns;
}
