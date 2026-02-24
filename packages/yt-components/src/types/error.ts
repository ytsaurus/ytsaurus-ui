export type YTPermissionType =
    | 'administer'
    | 'create'
    | 'read'
    | 'write'
    | 'use'
    | 'manage'
    | 'modify_children'
    | 'mount'
    | 'remove'
    | 'register_queue_consumer';

export type YTErrorBlockTabs = Record<'attributes' | 'details' | 'stderrs', unknown>;

export type YTErrorKnownAttributes = {
    tablet_id?: string | number;
    user?: string;
    permission?: Array<YTPermissionType>;
} & YTErrorBlockTabs;

export type YTError<
    AttributesT extends {attributes?: object} = {attributes?: YTErrorKnownAttributes},
> = {
    message: string;
    code?: number;
    inner_errors?: Array<YTError<AttributesT>>;
    yt_javascript_wrapper?: {xYTTraceId?: string; xYTRequestId?: string};
} & AttributesT;

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

export type TabletErrorsBaseParams = {
    start_timestamp: number;
    end_timestamp: number;
    methods?: Array<string>;
    count_limit: number;
    offset: number;
    fixed_end_timestamp?: unknown;
};

export type TabletError = {
    tablet_id: string;
    timestamp: number;
    error: YTError;
    method: string;
    host: string;
};
