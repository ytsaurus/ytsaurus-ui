import type {Plan, Progress} from '../../pages/query-tracker/Plan/models/plan';
import {TypeArray} from '../../components/SchemaDataType/dataTypes';
import {QueriesHistoryCursorDirection} from '../../store/reducers/query-tracker/query-tracker-contants';
import {VisualizationState} from '../../store/reducers/query-tracker/queryChartSlice';
import {YTError} from '../index';
import {QueryStatus} from './index';
import {QueryEngine} from '../../../shared/constants/engines';

export type QTRequestOptions = {
    stage?: string;
    yqlAgentStage?: string;
};

export type QueryItemId = string;

export type YQLStatistic = {sum?: number; count?: number; avg?: number; max?: number; min?: number};

export type YQLSstatistics = Record<string, any>;

export type QueryFileType = 'url' | 'raw_inline_data';

export type QueryFile = {
    id: string;
    name: string;
    content: string;
    type: QueryFileType;
};

export type QuerySecret = {
    id: string;
    ypath: string;
};

export interface DraftQuery {
    id?: QueryItemId;
    engine: QueryEngine;
    supportedEngines: Record<QueryEngine, boolean>;
    files: QueryFile[];
    secrets: QuerySecret[];
    query: string;
    annotations?: {
        title?: string;
    };
    settings?: {
        cluster?: string;
        clique?: string;
        discovery_path?: string; // old request type. Deprecated
        discovery_group?: string;
        execution_mode?: 'validate' | 'optimize';
    } & Record<string, string>;
    error?: unknown;
    access_control_object: string;
    access_control_objects?: string[];
}

export type ErrorPosition = {column: number; row: number};

export type QueryError = YTError<{
    attributes: {
        address?: string;
        connection_id?: string;
        connection_type?: string;
        datetime?: string;
        encryption_mode?: string;
        fid?: number;
        host?: string;
        method?: string;
        pid?: number;
        realm_id?: string;
        request_id?: string;
        service?: string;
        span_id?: number;
        thread?: string;
        tid?: number;
        timeout?: number;
        trace_id?: string;
        verification_mode?: string;
        end_position?: ErrorPosition;
        severity?: string;
        start_position?: ErrorPosition;
        yql_status?: string;
    };
}>;

export type CHYTProgress = {
    finished: boolean;
    read_bytes: number;
    read_rows: number;
    total_bytes_to_read: number;
    total_rows_to_read: number;
};

export type SingleProgress = {
    yql_plan?: Plan;
    yql_statistics?: YQLSstatistics;
    yql_progress?: Progress;
    spyt_progress?: number;
    total_progress?: CHYTProgress;
};

export type CHYTMultiProgress = {
    queries_count: number;
    progress: {query_id: string; total_progress: CHYTProgress}[];
};

export interface QueryItem extends DraftQuery {
    id: QueryItemId;
    start_time: string;
    finish_time: string;
    user: string;
    state: QueryStatus;
    result_count: number;
    progress?: SingleProgress | CHYTMultiProgress;
    error?: QueryError;
    is_tutorial?: boolean;
    annotations?: {
        title?: string;
        chartConfig?: VisualizationState;
        is_tutorial?: boolean;
    };
}

export type QueriesListCursorParams = {
    cursor_time?: string;
    cursor_direction: QueriesHistoryCursorDirection;
};

export type QueriesListParams = {
    is_tutorial?: string;
    user?: string;
    engine?: string;
    filter?: string;
    from_time?: number;
    to_time?: number;
    state?: QueryStatus;
    tutorial_filter?: boolean;
};

export type QueriesListRequestParams = {
    params: QueriesListParams;
    cursor?: QueriesListCursorParams;
    limit?: number;
};

export type QueriesListResponse = {
    incomplete: boolean;
    queries: QueryItem[];
    timestamp: number;
};

export type QueryResult = {
    all_column_names: string[];
    incomplete_all_column_names: boolean;
    incomplete_columns: boolean;
    rows: Record<string, [unknown, string]>[]; //Record<string, {$value: unknown; $type: string}>[];
    yql_type_registry: TypeArray[];
};

export type QueryResultMetaScheme = {
    name: string;
    required: boolean;
    type: string;
    type_v3: {
        type_name: string;
        item: string;
    };
};

export type QueryResultMeta = {
    id: string;
    result_index: number;
    schema: {
        $attributes: {
            strict: boolean;
            unique_keys: boolean;
        };
        $value: QueryResultMetaScheme[];
    };
    is_truncated: boolean;
    data_statistics: {
        chunk_count: number;
        row_count: number;
        uncompressed_data_size: number;
        compressed_data_size: number;
        data_weight: number;
        regular_disk_space: number;
        erasure_disk_space: number;
        unmerged_row_count: number;
        unmerged_data_weight: number;
    };
    full_result?: {
        cluster: string;
        table_path: string;
    };
    error?: unknown;
};

// Utility function that needs to be available with types
export const isSingleProgress = (
    progress?: SingleProgress | CHYTMultiProgress,
): progress is SingleProgress => {
    return Boolean(progress) && !('queries_count' in progress!);
};

// Define these constants based on string values to avoid circular dependencies
export const AbortableStatuses = ['running', 'pending'];

export const CompletedStates = ['draft', 'aborted', 'completed', 'failed'];

// Engines constant and utility function
export const Engines = Object.values(QueryEngine);

export function isEngine(engine: string): engine is QueryEngine {
    return Engines.includes(engine as unknown as QueryEngine);
}
