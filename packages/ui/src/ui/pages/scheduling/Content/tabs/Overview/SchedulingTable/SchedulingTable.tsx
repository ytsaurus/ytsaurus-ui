import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import type {ColumnDef} from '@gravity-ui/table/tanstack';

import ColumnHeader from '../../../../../../components/ColumnHeader/ColumnHeader';
import {DataTableGravity, useTable} from '../../../../../../components/DataTableGravity';
import {setExpandedPools} from '../../../../../../store/actions/scheduling/expanded-pools';
import {
    getSchedulingOverviewTableItems,
    getCurrentTreeExpandedPools,
} from '../../../../../../store/selectors/scheduling/scheduling';
import {getSchedulingOperationsLoadingStatus} from '../../../../../../store/selectors/scheduling/expanded-pools';

import './SchedulingTable.scss';

import i18n from './i18n';

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

    const dispatch = useDispatch();
    const expandedPools = useSelector(getCurrentTreeExpandedPools);

    const handlePoolExpand = React.useCallback(
        (poolName: string, value: boolean) => {
            dispatch(setExpandedPools({[poolName]: value}));
        },
        [dispatch],
    );

    const columns: Array<ColumnDef<RowData>> = [
        {
            id: 'name',
            header: () => <ColumnHeader column={i18n('pool-operation')} loading={loading} />,
            cell: ({row}) => {
                const {
                    name,
                    type,
                    level = 0,
                    child_pool_count = 0,
                    pool_operation_count = 0,
                } = row.original;
                const allowExpand = child_pool_count || pool_operation_count;
                const expanded = type === 'pool' ? expandedPools?.get(name) : undefined;
                return (
                    <div
                        style={{paddingLeft: level * 40}}
                        onClick={() => handlePoolExpand(name, !expanded)}
                    >
                        {allowExpand ? (expanded ? '- ' : '+ ') : null}
                        {name}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: () => {},
        },
    ];
    return columns;
}
