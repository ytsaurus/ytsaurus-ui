import axios, {AxiosResponse, CancelToken} from 'axios';
import {YTError} from '../@types/types';

export const TABLET_ERRORS_MANAGER_POST_ACTIONS = new Set([
    'tablet_errors_by_bundle',
    'tablet_errors_by_table',
    'tablet_errors_by_table_and_timestamp',
] as const);

export type TabletErrorsManagerPostActionType = Parameters<
    (typeof TABLET_ERRORS_MANAGER_POST_ACTIONS)['add']
>[0];

export type MethodCount = {
    method: string;
    count: number;
};

export type TableMethodErrorsCount = {
    table_path: string;
    last_error_timestamp: number;
    method_counts: Record<string, number>;
};

export type TabletErrorsByBundleResponse = {
    all_methods: Array<string>;
    presented_methods: Array<string>;
    errors: Array<TableMethodErrorsCount>;
    fixed_end_timestamp: unknown;
    total_row_count: number;
};

export type TabletErrorsBaseParams = {
    start_timestamp: number;
    end_timestamp: number;
    methods?: Array<string>;
    count_limit: number;
    offset: number;
    fixed_end_timestamp?: unknown;
};

export type TabletMethodError = {
    tablet_id: string;
    timestamp: number;
    method: string;
    error: YTError;
};

export type MethodErrors = {
    method: string;
    errors: Array<TabletError>;
    fixed_end_timestamp: number;
    total_row_count: number;
    all_methods: Array<string>;
    error_count_limit_exceeded?: boolean;
};

export type TabletError = {
    tablet_id: string;
    timestamp: number;
    error: YTError;
    method: string;
    host: string;
};

export type TabletErrorsApi = {
    tablet_errors_by_bundle: {
        body: TabletErrorsBaseParams & {tablet_cell_bundle: string; table_path?: string};
        response: TabletErrorsByBundleResponse;
    };
    tablet_errors_by_table: {
        body: TabletErrorsBaseParams & {table_path: string; table_id: string; tablet_id?: string};
        response: MethodErrors;
    };
    tablet_errors_by_table_and_timestamp: {
        body: TabletErrorsBaseParams & {table_id: string};
        response: Array<TabletMethodError>;
    };
};

export function fetchFromTabletErrorsApi<K extends keyof TabletErrorsApi>(
    action: K,
    cluster: string,
    params: TabletErrorsApi[K]['body'],
    cancelToken: CancelToken,
): Promise<AxiosResponse<TabletErrorsApi[K]['response']>> {
    type ApiMethod = TabletErrorsApi[K];

    return axios.post<
        ApiMethod['response'],
        AxiosResponse<ApiMethod['response']>,
        ApiMethod['body']
    >(`/api/tablet-errors/${cluster}/${action}`, {...params, cluster}, {cancelToken});
}
