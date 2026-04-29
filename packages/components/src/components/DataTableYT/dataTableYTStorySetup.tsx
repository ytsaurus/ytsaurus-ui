import {type CSSProperties} from 'react';

import {type Column, type DataTableYtProps} from './DataTableYT';

export type DataTableYTDemoRow = {
    id: string;
    name: string;
    value: number;
};

export const THEME_YANDEX_CLOUD = 'yandex-cloud';
export const THEME_LEGACY = 'legacy';

export const dataTableYTDemoColumns: Column<DataTableYTDemoRow>[] = [
    {name: 'id', title: 'ID', width: 100},
    {name: 'name', title: 'Name'},
    {
        name: 'value',
        title: 'Value',
        width: 100,
        align: 'right',
        render: ({value}) => (
            <span>{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
        ),
    },
];

export const dataTableYTSampleData: DataTableYTDemoRow[] = [
    {id: 'row-1', name: 'Alpha', value: 100},
    {id: 'row-2', name: 'Beta', value: 250},
    {id: 'row-3', name: 'Gamma', value: 42},
];

export const dataTableYTDefaultSettings: NonNullable<
    DataTableYtProps<DataTableYTDemoRow>['settings']
> = {
    displayIndices: false,
    sortable: true,
    stripedRows: true,
};

export const dataTableYTStoryFrameStyle: CSSProperties = {
    maxWidth: 720,
};

export type DataTableYTStoryArgs = {
    data: DataTableYTDemoRow[];
    loaded?: boolean;
    loading?: boolean;
    useThemeYT: boolean;
    theme: string;
    disableRightGap?: boolean;
    noItemsText?: string;
    settings: NonNullable<DataTableYtProps<DataTableYTDemoRow>['settings']>;
};

export const dataTableYTStoryDefaultArgs: DataTableYTStoryArgs = {
    data: dataTableYTSampleData,
    loaded: true,
    loading: false,
    useThemeYT: true,
    theme: THEME_YANDEX_CLOUD,
    disableRightGap: false,
    settings: dataTableYTDefaultSettings,
};

/** Stable order for Playwright screenshots (matches story variants). */
export const dataTableYTVisualCaseOrder = [
    'default',
    'gravity-yandex-cloud',
    'gravity-legacy',
    'empty',
    'loading',
] as const;

export type DataTableYTVisualCaseId = (typeof dataTableYTVisualCaseOrder)[number];
