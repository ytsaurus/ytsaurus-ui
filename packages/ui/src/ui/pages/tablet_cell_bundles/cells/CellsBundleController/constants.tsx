import i18n from '../i18n';

import DataTable, {type Column, type Settings} from '@gravity-ui/react-data-table';
import {STICKY_TOOLBAR_BOTTOM} from '../../../../components/WithStickyToolbar/WithStickyToolbar';

import {
    renderActions,
    renderAddress,
    renderAllocationRequest,
    renderAllocationState,
    renderMemory,
    renderType,
} from './utils';
import {type RowData} from './types';

export const COLUMNS: Array<Column<RowData>> = [
    {
        name: 'Address',
        get header() {
            return i18n('field_address');
        },
        render: renderAddress,
        sortable: false,
    },
    {
        name: 'Type',
        get header() {
            return i18n('field_type');
        },
        render: renderType,
        sortable: false,
        width: 200,
    },
    {
        name: 'tablet_static_memory',
        get header() {
            return i18n('field_tablet-static-memory');
        },
        render: renderMemory,
        sortable: false,
        width: 200,
        align: 'center',
    },
    {
        name: 'Allocation request',
        get header() {
            return i18n('field_allocation-request');
        },
        render: renderAllocationRequest,
        width: 300,
        align: 'center',
        sortable: false,
    },
    {
        name: 'Allocation state',
        get header() {
            return i18n('field_allocation-state');
        },
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

export const TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    syncHeadOnResize: true,
    dynamicRender: true,
};
