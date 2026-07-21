import {
    type AllocatedInstance,
    type InProgressInstance,
} from '../../../../store/reducers/tablet_cell_bundles';

export type RowData = {
    address?: string;
    url?: string;
    data?: AllocatedInstance;
    allocationState?: InProgressInstance['hulk_request_state'] | 'removing';
    hulkRequestPath?: string;
    tablet_static_memory?: {used?: number; limit?: number};
    deployUrl?: string;
    nannyUrl?: string;
};

export type ColumnRenderProps<T> = {
    value?: unknown;
    row: T;
    index: number;
    footer?: boolean;
    headerData?: boolean;
};
