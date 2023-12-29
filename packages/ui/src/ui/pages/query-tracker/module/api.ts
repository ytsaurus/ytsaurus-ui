import {ThunkAction} from 'redux-thunk';
import {getQueryTrackerCluster} from '../../../config';
import {extractBatchV4Values, splitBatchResults} from '../../../utils/utils';
import {BatchResultsItem, BatchSubRequest} from '../../../../shared/yt-types';
import {YTApiId, ytApiV3, ytApiV4Id} from '../../../rum/rum-wrap-api';
import ypath from '../../../common/thor/ypath';
import type {Plan, Progress} from '../Plan/models/plan';
import {TypeArray} from '../../../components/SchemaDataType/dataTypes';
import {getClusterConfigByName, getClusterProxy} from '../../../store/selectors/global';
import {generateQuerySettings, generateQueryText} from '../utils/query_generate';
import {RootState} from '../../../store/reducers';
import {makeDirectDownloadPath} from '../../../utils/navigation';
import {getQueryTrackerRequestOptions} from './query/selectors';
import {UPDATE_QUERIES_LIST} from './query-tracker-contants';
import {AnyAction} from 'redux';
import {QueryEngine} from './engines';
import {getLastSelectedACONamespaces} from './query_aco_list/selectors';
import {setSettingByKey} from '../../../store/actions/settings';

function getQTApiSetup(): {proxy?: string} {
    const QT_CLUSTER = getQueryTrackerCluster();
    if (QT_CLUSTER) {
        const cluster = getClusterConfigByName(QT_CLUSTER);
        if (cluster) {
            return {
                proxy: getClusterProxy(cluster),
            };
        }
    }
    return {};
}

function makeGetQueryParams(query_id: string) {
    return {
        query_id,
        output_format: {
            $value: 'json',
            $attributes: {
                encode_utf8: 'false',
            },
        },
    };
}

export type QTRequestOptions = {
    stage?: string;
    yqlAgentStage?: string;
};

export const Engines = Object.values(QueryEngine);

export function isEngine(engine: string): engine is QueryEngine {
    return Engines.includes(engine as unknown as QueryEngine);
}

export type QueryItemId = string;

export type YQLStatistic = {sum?: number; count?: number; avg?: number; max?: number; min?: number};

export type YQLSstatistics = Record<string, any>;

export type QueryFile = {
    name: string;
    content: string;
    type: 'url' | 'raw_inline_data';
};

export interface DraftQuery {
    id?: QueryItemId;
    engine: QueryEngine;
    files: QueryFile[];
    query: string;
    annotations?: {
        title?: string;
    };
    settings?: {};
    error?: unknown;
    access_control_object: string;
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
        yql_progress?: Progress;
    };
    access_control_object: string;
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
    is_tutorial?: string;
    user?: string;
    engine?: string;
    filter?: string;
};

export type QueriesListRequestParams = {
    params: QueriesListParams;
    cursor?: QueriiesListCursorParams;
    limit?: number;
};

export async function generateQueryFromTable(
    engine: QueryEngine,
    {cluster, path}: {cluster: string; path: string},
): Promise<DraftQuery | undefined> {
    const selectedCluster = getClusterConfigByName(cluster);
    const node = await ytApiV3.get({
        parameters: {
            path: `${path}/@`,
            attributes: ['type', 'schema', 'dynamic'],
            output_format: {
                $value: 'json',
                $attributes: {
                    encode_utf8: 'false',
                },
            },
        },
        setup: {
            proxy: getClusterProxy(selectedCluster),
        },
    });
    if (node.type === 'table') {
        const schema = ypath.getValue(node.schema) as {name: string}[];
        return {
            engine,
            query: generateQueryText(cluster, engine, {
                path,
                columns: schema.map(({name}) => name),
                pageSize: 50,
                schemaExists: Boolean(schema.length),
                dynamic: node.dynamic,
            }),
            files: [],
            annotations: {},
            access_control_object: 'nobody',
            settings: generateQuerySettings(engine, cluster),
        };
    }
    return undefined;
}

export function loadQueriesList({params, cursor, limit}: QueriesListRequestParams): ThunkAction<
    Promise<{
        incomplete: boolean;
        queries: QueryItem[];
        timestamp: number;
    }>,
    RootState,
    any,
    any
> {
    return async (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        return ytApiV4Id.listQueries(YTApiId.listQueries, {
            parameters: {
                stage,
                ...params,
                ...cursor,
                limit,
                output_format: {
                    $value: 'json',
                    $attributes: {
                        encode_utf8: 'false',
                    },
                },
            },
            setup: getQTApiSetup(),
        });
    };
}

export function getQuery(query_id: string): ThunkAction<Promise<QueryItem>, RootState, any, any> {
    return (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        return ytApiV4Id.getQuery(YTApiId.getQuery, {
            parameters: {stage, ...makeGetQueryParams(query_id)},
            setup: getQTApiSetup(),
        });
    };
}

export function startQuery(
    queryInstance: DraftQuery,
): ThunkAction<Promise<{query_id: QueryItemId}>, RootState, any, any> {
    return async (_dispatch, getState) => {
        const state = getState();
        const {stage, yqlAgentStage} = getQueryTrackerRequestOptions(state);
        const {query, engine, settings, annotations, files, access_control_object} = queryInstance;

        return ytApiV4Id.startQuery(YTApiId.startQuery, {
            parameters: {
                stage,
                query,
                files,
                engine,
                annotations,
                access_control_object,
                settings: {
                    stage: engine === 'yql' ? yqlAgentStage : undefined,
                    ...settings,
                },
                output_format: {
                    $value: 'json',
                    $attributes: {
                        encode_utf8: 'false',
                    },
                },
            },
            setup: getQTApiSetup(),
        });
    };
}

export function abortQuery(params: {
    query_id: string;
    message?: string;
}): ThunkAction<Promise<void>, RootState, any, any> {
    return async (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        const {query_id, message} = params;
        return ytApiV4Id.abortQuery(YTApiId.abortQuery, {
            parameters: {
                stage,
                query_id,
                message,
            },
            setup: getQTApiSetup(),
        });
    };
}

type QueryResult = {
    all_column_names: string[];
    incomplete_all_column_names: boolean;
    incomplete_columns: boolean;
    rows: Record<string, [unknown, string]>[]; //Record<string, {$value: unknown; $type: string}>[];
    yql_type_registry: TypeArray[];
};

type QueryResultRows = QueryResult['rows'];
type QueryResultRowSet = QueryResultRows[number];

/**
 * Format limitations dictate system column names being prefixed by double dollar sign instead
 * of a single on, here we just replace the stuff
 */
const mapQueryRowNames = (rows: QueryResultRows) => {
    const replaceReg = /^\$\$/;
    const replaceRows = (rowSet: QueryResultRowSet) =>
        Object.keys(rowSet).reduce(
            (result, next) => ({...result, [next.replace(replaceReg, '$')]: rowSet[next]}),
            {} as QueryResultRowSet,
        );

    return rows.map(replaceRows);
};

export function readQueryResults(
    query_id: string,
    result_index = 0,
    cursor: {start: number; end: number},
    columns: string[],
    settings: {
        cellsSize: number;
    },
): ThunkAction<Promise<QueryResult>, RootState, any, any> {
    return async (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        const result = (await ytApiV4Id.readQueryResults(YTApiId.readQueryResults, {
            parameters: {
                stage,
                query_id,
                result_index,
                lower_row_index: cursor?.start,
                upper_row_index: cursor?.end,
                output_format: {
                    $value: 'web_json',
                    $attributes: {
                        column_names: columns,
                        value_format: 'yql',
                        field_weight_limit: settings?.cellsSize,
                        encode_utf8: 'false',
                        max_selected_column_count: 3000,
                    },
                },
            },
            setup: getQTApiSetup(),
        })) as QueryResult;
        return {...result, rows: mapQueryRowNames(result.rows)};
    };
}

export function getDownloadQueryResultURL(
    cluster: string,
    queryId: string,
    resultIndex = 0,
    cursor: {start: number; end: number} | undefined,
): ThunkAction<string, RootState, any, any> {
    return (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
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

        if (stage) {
            params.set('stage', stage);
        }
        const clusterConfig = getClusterConfigByName(getQueryTrackerCluster() || cluster);
        if (clusterConfig) {
            const {proxy, externalProxy} = clusterConfig;
            const base = makeDirectDownloadPath('read_query_result', {
                cluster,
                version: 'v4',
                proxy,
                externalProxy,
            });
            return `${base}?${params.toString()}`;
        }
        return '';
    };
}

export function requestQueries(
    ids: string[],
): ThunkAction<Promise<QueryItem[]>, RootState, any, any> {
    return async (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        const requests: BatchSubRequest[] = ids.map((query_id) => ({
            command: 'get_query',
            parameters: {stage, ...makeGetQueryParams(query_id)},
        }));
        const resp = (await ytApiV4Id.executeBatch(YTApiId.getQuery, {
            parameters: {
                requests: requests,
                output_format: {
                    $value: 'json',
                    $attributes: {
                        encode_utf8: 'false',
                    },
                },
            },
            setup: getQTApiSetup(),
        })) as unknown as {results: BatchResultsItem<QueryItem>[]};

        const extracted = extractBatchV4Values(resp, requests);
        const {results} = splitBatchResults(extracted.results ?? []);
        return results;
    };
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
    error?: unknown;
};

export function getQueryResultMeta(
    query_id: string,
    result_index = 0,
): ThunkAction<Promise<QueryResultMeta | undefined>, RootState, any, any> {
    return (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        return ytApiV4Id.getQueryResults(YTApiId.getQueryResults, {
            parameters: {stage, query_id, result_index},
            setup: getQTApiSetup(),
        });
    };
}

export function getQueryResultMetaList(
    query_id: string,
    inds: number[],
): ThunkAction<Promise<BatchResultsItem<QueryResultMeta>[]>, RootState, any, any> {
    return async (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        const requests: BatchSubRequest[] = inds.map((ind) => ({
            command: 'get_query_result',
            parameters: {stage, query_id, result_index: ind},
        }));
        const {results} = (await ytApiV4Id.executeBatch<QueryResultMeta>(YTApiId.getQueryResults, {
            parameters: {
                requests: requests,
                output_format: {
                    $value: 'json',
                    $attributes: {
                        encode_utf8: 'false',
                    },
                },
            },
            setup: getQTApiSetup(),
        })) as unknown as {results: BatchResultsItem<QueryResultMeta>[]};
        return results;
    };
}

export function setQueryName(
    query_id: string,
    annotations: QueryItem['annotations'],
): ThunkAction<Promise<any>, RootState, any, AnyAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        await ytApiV4Id.alterQuery(YTApiId.alterQuery, {
            parameters: {
                stage,
                query_id,
                annotations,
            },
            setup: getQTApiSetup(),
        });
        const query = await dispatch(getQuery(query_id));
        dispatch({
            type: UPDATE_QUERIES_LIST,
            data: [query],
        });
    };
}

export function addACOToLastSelected(
    aco: string,
): ThunkAction<Promise<any>, RootState, any, AnyAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const lastSelectedACONamespaces = getLastSelectedACONamespaces(state);

        await dispatch(
            setSettingByKey('global::queryTracker::lastSelectedACOs', [
                aco,
                ...lastSelectedACONamespaces.filter((item) => item !== aco).slice(0, 9),
            ]),
        );
    };
}

export function updateACOQuery({
    aco,
    query_id,
}: {
    aco: string;
    query_id: string;
}): ThunkAction<Promise<any>, RootState, any, AnyAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);

        return ytApiV4Id
            .alterQuery(YTApiId.alterQuery, {
                parameters: {
                    stage,
                    query_id,
                    access_control_object: aco,
                },
                setup: getQTApiSetup(),
            })
            .then(() => {
                return dispatch(addACOToLastSelected(aco));
            });
    };
}
