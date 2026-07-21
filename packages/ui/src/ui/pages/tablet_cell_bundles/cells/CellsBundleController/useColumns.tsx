import React from 'react';

import {type Column} from '@gravity-ui/react-data-table';

import i18n from '../i18n';

import {
    renderActions,
    renderAddress,
    renderAllocationRequest,
    renderAllocationState,
    renderColumnHeader,
    renderMemory,
    renderType,
} from './utils';
import {type ColumnsParams, type RowData} from './types';

/*
 * All columns use sortable: false — sorting is handled manually here instead of
 * relying on DataTable's built-in sort, since it needs to stay in sync with the URL and redux state.
 */
const getColumns = ({sortState, onSortChange}: ColumnsParams): Array<Column<RowData>> => {
    return [
        {
            name: 'Address',
            header: renderColumnHeader({
                column: 'address',
                title: i18n('field_address'),
                sortState,
                onSortChange,
                allowedOrderTypes: ['asc-undefined', 'undefined-desc'],
            }),
            render: renderAddress,
            sortable: false,
        },
        {
            name: 'Type',
            header: i18n('field_type'),
            render: renderType,
            sortable: false,
            width: 200,
        },
        {
            name: 'tablet_static_memory',
            header: i18n('field_tablet-static-memory'),
            render: renderMemory,
            sortable: false,
            width: 200,
            align: 'center',
        },
        {
            name: 'Allocation request',
            header: i18n('field_allocation-request'),
            render: renderAllocationRequest,
            width: 300,
            align: 'center',
            sortable: false,
        },
        {
            name: 'Allocation state',
            header: renderColumnHeader({
                column: 'allocationState',
                title: i18n('field_allocation-state'),
                sortState,
                onSortChange,
            }),
            render: renderAllocationState,
            sortable: false,
            align: 'center',
            width: 200,
        },
        {
            name: '',
            render: renderActions,
            width: 80,
            align: 'center',
        },
    ];
};

type UseColumnsParams = ColumnsParams & {
    hideColumns?: Array<string>;
};

export const useColumns = ({hideColumns, sortState, onSortChange}: UseColumnsParams) => {
    const res = React.useMemo(() => {
        const columns = getColumns({sortState, onSortChange});
        if (!hideColumns?.length) {
            return columns;
        }

        const toHide = new Set(hideColumns);
        return columns.filter((item) => !toHide.has(item.name));
    }, [hideColumns, sortState, onSortChange]);
    return res;
};
