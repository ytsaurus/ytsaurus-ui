import {ThunkAction} from 'redux-thunk';

import {splitBatchResults} from '../../../../shared/utils/error';
import {getQueryTrackerCluster} from '../../../config';
import {extractBatchV4Values} from '../../../utils/utils';
import {BatchResultsItem, BatchSubRequest} from '../../../../shared/yt-types';
import {YTApiId, ytApiV3, ytApiV4Id} from '../../../rum/rum-wrap-api';
import ypath from '../../../common/thor/ypath';
import {getClusterConfigByName, getClusterProxy} from '../../selectors/global';
import {RootState} from '../../reducers';
import {makeDirectDownloadPath} from '../../../utils/navigation';
import {UPDATE_QUERIES_LIST} from '../../reducers/query-tracker/query-tracker-contants';
import {
    getEffectiveApiStage,
    getQueryAnnotations,
    getQueryTrackerRequestOptions,
} from '../../selectors/query-tracker/query';
import {AnyAction} from 'redux';
import {QueryEngine} from '../../../../shared/constants/engines';
import {
    getLastSelectedACONamespaces,
    selectIsMultipleAco,
} from '../../selectors/query-tracker/queryAco';
import {setSettingByKey} from '../settings';
import {CancelTokenSource} from 'axios';
import {JSONSerializer} from '../../../common/yt-api';
import {createTablePrompt} from '../../../pages/query-tracker/Navigation/helpers/createTableSelect';
import {getQueryResultGlobalSettings} from '../../selectors/query-tracker/queryResult';
import {convertSettingsTypes} from '../../../utils/query-tracker/convertSettingsTypes';
import type {
    DraftQuery,
    QueriesListRequestParams,
    QueriesListResponse,
    QueryItem,
    QueryItemId,
    QueryResult,
    QueryResultMeta,
} from '../../../types/query-tracker/api';

export function getQTApiSetup(): {proxy?: string} {
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
        output_format: 'json',
    };
}

// Re-export types for backward compatibility
export type {
    DraftQuery,
    QueryItem,
    QueryItemId,
    QueryResult,
    QueryResultMeta,
    QueriesListRequestParams,
    QueriesListResponse,
    QueryFile,
    QuerySecret,
    QueryFileType,
    YQLStatistic,
    YQLSstatistics,
    ErrorPosition,
    QueryError,
    CHYTProgress,
    SingleProgress,
    CHYTMultiProgress,
    QueriesListCursorParams,
    QueriesListParams,
    QueryResultMetaScheme,
    QTRequestOptions,
} from '../../../types/query-tracker/api';

// Re-export constants and functions
export {
    isSingleProgress,
    AbortableStatuses,
    CompletedStates,
    Engines,
    isEngine,
} from '../../../types/query-tracker/api';

export async function generateQueryFromTable(
    engine: QueryEngine,
    {cluster, path, defaultQueryACO}: {cluster: string; path: string; defaultQueryACO: string},
): Promise<DraftQuery | undefined> {
    const selectedCluster = getClusterConfigByName(cluster);
    const {pageSize} = getQueryResultGlobalSettings();

    const node = await ytApiV3.get({
        parameters: {
            path: `${path}/@`,
            attributes: ['type', 'schema', 'dynamic', '_yql_type'],
            output_format: 'json',
        },
        setup: {
            proxy: getClusterProxy(selectedCluster),
            JSONSerializer,
        },
    });

    const commonData = {
        engine,
        supportedEngines: {
            spyt: false,
            chyt: false,
            yql: true,
            ql: true,
        },
        files: [],
        secrets: [],
        annotations: {},
        access_control_object: defaultQueryACO,
        access_control_objects: [defaultQueryACO],
        settings: {
            cluster,
        },
    };

    if (node.type === 'table') {
        const schema = ypath.getValue(node.schema) as {name: string}[];
        return {
            query: createTablePrompt({schema, path, engine, cluster, limit: pageSize}),
            ...commonData,
        };
    } else if (node.type === 'document' && 'view' === ypath.getValue(node._yql_type)) {
        const query = await ytApiV3.get({
            parameters: {path},
            setup: {proxy: getClusterProxy(selectedCluster), JSONSerializer},
        });
        return {query, ...commonData};
    }
    return undefined;
}

export function loadQueriesList({
    params,
    cursor,
    limit,
}: QueriesListRequestParams): ThunkAction<Promise<QueriesListResponse>, RootState, any, any> {
    return async (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        return ytApiV4Id.listQueries(YTApiId.listQueries, {
            parameters: {
                stage,
                ...params,
                ...cursor,
                limit,
                output_format: 'json',
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
            setup: {
                ...getQTApiSetup(),
                JSONSerializer,
            },
        });
    };
}

export function startQuery(
    queryInstance: DraftQuery,
    options?: {execution_mode: 'validate' | 'optimize'},
): ThunkAction<Promise<{query_id: QueryItemId}>, RootState, any, any> {
    return async (_dispatch, getState) => {
        const state = getState();
        const isMultipleAco = selectIsMultipleAco(state);
        const {stage, yqlAgentStage} = getQueryTrackerRequestOptions(state);
        const {
            query,
            engine,
            settings,
            annotations,
            files,
            secrets,
            access_control_objects,
            access_control_object,
        } = queryInstance;

        const processedSettings = engine === 'spyt' ? convertSettingsTypes(settings) : settings;

        return ytApiV4Id.startQuery(YTApiId.startQuery, {
            parameters: {
                stage,
                query,
                files,
                secrets,
                engine,
                annotations,
                ...(isMultipleAco ? {access_control_objects} : {access_control_object}),
                settings: {
                    stage: engine === 'yql' ? yqlAgentStage : undefined,
                    ...processedSettings,
                    execution_mode: options?.execution_mode,
                },
                output_format: 'json',
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
        stringLimit?: number;
    },
    cancellation?: (token: CancelTokenSource) => void,
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
                        string_weight_limit: settings?.stringLimit,
                        max_selected_column_count: 3000,
                    },
                },
            },
            setup: {...getQTApiSetup(), JSONSerializer},
            cancellation,
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
                output_format: 'json',
            },
            setup: getQTApiSetup(),
        })) as unknown as {results: BatchResultsItem<QueryItem>[]};

        const extracted = extractBatchV4Values(resp, requests);
        const {results} = splitBatchResults(
            extracted.results ?? [],
            'Failed to fetch query-tracker',
        );
        return results;
    };
}

export function getQueryResultMeta(
    query_id: string,
    result_index = 0,
): ThunkAction<Promise<QueryResultMeta>, RootState, any, any> {
    return (_dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);
        return ytApiV4Id.getQueryResults(YTApiId.getQueryResults, {
            parameters: {stage, query_id, result_index},
            setup: {
                ...getQTApiSetup(),
                JSONSerializer,
            },
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
        const {results} = await ytApiV4Id.executeBatch<QueryResultMeta>(YTApiId.getQueryResults, {
            parameters: {
                requests: requests,
                output_format: 'json',
            },
            setup: getQTApiSetup(),
        });
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
    aco: string[],
): ThunkAction<Promise<any>, RootState, any, AnyAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const lastSelectedACONamespaces = getLastSelectedACONamespaces(state);
        const stage = getEffectiveApiStage(state);

        await dispatch(
            setSettingByKey(`qt-stage::${stage}::queryTracker::lastSelectedACOs`, [
                ...aco,
                ...lastSelectedACONamespaces
                    .filter((item: string) => !aco.includes(item))
                    .slice(0, 9),
            ]),
        );
    };
}

export function updateACOQuery({
    aco,
    query_id,
}: {
    aco: string[];
    query_id: string;
}): ThunkAction<Promise<any>, RootState, any, AnyAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const isMultipleAco = selectIsMultipleAco(state);
        const {stage} = getQueryTrackerRequestOptions(state);
        const annotations = getQueryAnnotations(state);
        const chartConfig = state.queryTracker.queryChart.visualization;

        return ytApiV4Id
            .alterQuery(YTApiId.alterQuery, {
                parameters: {
                    stage,
                    query_id,
                    ...(isMultipleAco
                        ? {access_control_objects: aco}
                        : {access_control_object: aco[0]}),
                    annotations: {
                        ...annotations,
                        chartConfig,
                    },
                },
                setup: getQTApiSetup(),
            })
            .then(() => {
                return dispatch(addACOToLastSelected(aco));
            });
    };
}

export function alterQueryChartConfig({
    query_id,
    aco,
    annotations,
    chartConfig,
}: {
    query_id: string;
    aco: string[];
    annotations: QueryItem['annotations'];
    chartConfig: unknown;
}): ThunkAction<Promise<any>, RootState, any, AnyAction> {
    return async (_dispatch, getState) => {
        const state = getState();
        const isMultipleAco = selectIsMultipleAco(state);
        const {stage} = getQueryTrackerRequestOptions(state);

        return ytApiV4Id.alterQuery(YTApiId.alterQuery, {
            parameters: {
                stage,
                query_id,
                ...(isMultipleAco
                    ? {access_control_objects: aco}
                    : {access_control_object: aco[0]}),
                annotations: {
                    ...annotations,
                    chartConfig,
                },
            },
            setup: getQTApiSetup(),
        });
    };
}
