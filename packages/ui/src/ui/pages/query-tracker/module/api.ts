import {getQueryTrackerStage} from '../../../config';
import {extractBatchV4Values, splitBatchResults} from '../../../utils/utils';
import {BatchResultsItem} from '../../../../shared/yt-types';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';

import {Plan} from './types/plan';
import {TypeArray} from '../../../components/SchemaDataType/dataTypes';

const QT_STAGE = getQueryTrackerStage();

export enum QueryEngine {
    YT_QL = 'ql',
    YQL = 'yql',

    CHYT = 'chyt',
}

export const Engines = Object.values(QueryEngine);

export const EngineKeys = [QueryEngine.YQL, QueryEngine.YT_QL, QueryEngine.CHYT];

export function isEngine(engine: string): engine is QueryEngine {
    return Engines.includes(engine as unknown as QueryEngine);
}

export type QueryItemId = string;

export type YQLStatistic = {sum?: number; count?: number; avg?: number; max?: number; min?: number};

export type YQLSstatistics = Record<string, any>;

export interface DraftQuery {
    engine: QueryEngine;
    query: string;
    attributes?: {
        title?: string;
    };
    annotations?: {
        title?: string;
    };
    settings?: {};
}

export interface QueryItem extends DraftQuery {
    id: QueryItemId;
    start_time: string;
    finish_time: string;
    user: string;
    state: QueryStatus;
    result_count: number;
    progress?: {
        yql_plan?: Plan;
        yql_statistics?: YQLSstatistics;
    };
    error: unknown;
}

export enum QueryStatus {
    DRAFT = 'draft',
    RUNNING = 'running',
    PENDING = 'pending',
    COMPLETING = 'completing',
    COMPLETED = 'completed',
    FAILING = 'failing',
    FAILED = 'failed',
    ABORTING = 'aborting',
    ABORTED = 'aborted',
}

export const ProgressStatuses = [
    QueryStatus.RUNNING,
    QueryStatus.PENDING,
    QueryStatus.COMPLETING,
    QueryStatus.FAILING,
    QueryStatus.ABORTING,
];

export const AbortableStatuses = [QueryStatus.RUNNING, QueryStatus.PENDING];

export const CompletedStates = [
    QueryStatus.DRAFT,
    QueryStatus.ABORTED,
    QueryStatus.COMPLETED,
    QueryStatus.FAILED,
];

export enum QueriesHistoryCursorDirection {
    PAST = 'past',
    FUTURE = 'future',
}

export type QueriiesListCursorParams = {
    cursor_time: string;
    cursor_direction: QueriesHistoryCursorDirection;
};

export type QueriesListParams = {
    user?: string;
    engine?: string;
    filter?: string;
};

export type QueriesListRequestParams = {
    params: QueriesListParams;
    cursor?: QueriiesListCursorParams;
    limit?: number;
};

export function loadQueriesList({params, cursor, limit}: QueriesListRequestParams): Promise<{
    incomplete: boolean;
    queries: QueryItem[];
    timestamp: number;
}> {
    return ytApiV4Id.listQueries(YTApiId.listQueries, {
        parameters: {
            ...params,
            ...cursor,
            limit,
            stage: QT_STAGE,
            output_format: {
                $value: 'json',
                $attributes: {
                    encode_utf8: 'false',
                },
            },
        },
    });
}

export function getQuery(query_id: string): Promise<QueryItem> {
    return ytApiV4Id.getQuery(YTApiId.getQuery, {
        parameters: {
            query_id,
            stage: QT_STAGE,
            output_format: {
                $value: 'json',
                $attributes: {
                    encode_utf8: 'false',
                },
            },
        },
    });
}

// startQuery(query: DraftQuery)
export function startQuery(queryInstance: DraftQuery): Promise<{query_id: QueryItemId}> {
    const {query, engine, settings, annotations} = queryInstance;
    return ytApiV4Id.startQuery(YTApiId.startQuery, {
        query,
        engine,
        annotations,
        settings,
        stage: QT_STAGE,
        output_format: {
            $value: 'json',
            $attributes: {
                encode_utf8: 'false',
            },
        },
    });
}

export function abortQuery(query_id: string, message?: string): Promise<void> {
    return ytApiV4Id.abortQuery(YTApiId.abortQuery, {
        query_id,
        message,
        stage: QT_STAGE,
    });
}

type QueryResult = {
    all_column_names: string[];
    incomplete_all_column_names: boolean;
    incomplete_columns: boolean;
    rows: Record<string, [unknown, string]>[]; //Record<string, {$value: unknown; $type: string}>[];
    yql_type_registry: TypeArray[];
};

export function readQueryResults(
    query_id: string,
    result_index = 0,
    cursor?: {start: number; end: number},
    settings?: {
        cellsSize: number;
    },
): Promise<QueryResult> {
    return ytApiV4Id.readQueryResults(YTApiId.readQueryResults, {
        query_id,
        result_index,
        lower_row_index: cursor?.start,
        upper_row_index: cursor?.end,
        output_format: {
            $value: 'web_json',
            $attributes: {
                value_format: 'yql',
                field_weight_limit: settings?.cellsSize,
                encode_utf8: 'false',
            },
        },
        stage: QT_STAGE,
    });
}

export function getDownloadQueryResultURL(
    cluster: string,
    queryId: string,
    resultIndex = 0,
    cursor?: {start: number; end: number},
) {
    const params = new URLSearchParams({
        query_id: queryId,
        result_index: resultIndex.toString(),
        ...(cursor
            ? {
                  lower_row_index: cursor.start.toString(),
                  upper_row_index: cursor.end.toString(),
              }
            : {}),
    });

    if (QT_STAGE) {
        params.set('stage', QT_STAGE);
    }
    return `/api/yt/${cluster}/api/v4/read_query_result?${params.toString()}`;
}

export async function requestQueries(ids: string[]): Promise<QueryItem[]> {
    const requests: any[] = ids.map((query_id) => ({
        command: 'get_query',
        parameters: {
            query_id,
            stage: QT_STAGE,
        },
    }));
    const resp = (await ytApiV4Id.executeBatch(YTApiId.getQuery, {
        requests,
    })) as unknown as {results: BatchResultsItem<QueryItem>[]};

    const extracted = extractBatchV4Values(resp, requests);
    const {results} = splitBatchResults(extracted.results ?? []);
    return results;
}

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
};

export async function getQueryResultMeta(
    query_id: string,
    result_index = 0,
): Promise<QueryResultMeta | undefined> {
    return ytApiV4Id.getQueryResults(YTApiId.readQueryResults, {
        query_id,
        result_index,
        stage: QT_STAGE,
    });
}
