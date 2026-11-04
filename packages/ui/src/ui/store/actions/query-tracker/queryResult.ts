import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../reducers';
import {
    type QueryItem,
    type QueryResult,
    type QueryResultMeta,
    type QueryResultMetaScheme,
    getQueryResultMeta,
    getQueryResultMetaList,
    readQueryResults,
} from './api';
import {type Type, getSchemaDateType, parseV3Type} from '@ytsaurus/components';
import {
    selectHasQueryResult,
    selectQueryResult,
    selectQueryResultGlobalSettings,
    selectQueryResultSettings,
} from '../../selectors/query-tracker/queryResult';
import {getClusterConfigByName, getClusterProxy} from '../../selectors/global';
import {
    type QueryResultErrorState,
    type SourceQueryResultReadyState as QueryResultReadyState,
    QueryResultState,
    type SourceCell,
} from '../../../types/query-tracker/queryResult';
import {prepareSourceRows} from '../../../utils/query-tracker/resultRows';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {selectPrimitiveTypesMap} from '../../selectors/global/supported-features';
import ypath from '../../../common/thor/ypath';
import forEach_ from 'lodash/forEach';
import {waitForFontFamilies} from '../global/fonts';
import {type QueryResultsActions} from '../../reducers/query-tracker/queryResult';
import {
    REQUEST_QUERY_RESULTS,
    SET_QUERY_RESULTS,
    SET_QUERY_RESULTS_CELL_DATA,
    SET_QUERY_RESULTS_ERROR,
    SET_QUERY_RESULTS_ERRORS,
    SET_QUERY_RESULTS_PAGE,
    SET_QUERY_RESULTS_SETTINGS,
} from '../../reducers/query-tracker/query-tracker-contants';
import {ytApiV3} from '../../../rum/rum-wrap-api';
import executionI18n from '../../../pages/query-tracker/QueryEditor/QueryExecutionView/i18n';

export function applySettings(
    queryId: QueryItem['id'],
    resultIndex = 0,
    settings: Partial<QueryResultReadyState['settings']>,
): ThunkAction<any, RootState, unknown, QueryResultsActions> {
    return (dispatch) => {
        dispatch({
            type: SET_QUERY_RESULTS_SETTINGS,
            data: {
                queryId,
                index: resultIndex,
                settings,
            },
        });
        dispatch(updateQueryResult(queryId, resultIndex, 0));
    };
}

/** Updates result view settings without refetching rows (e.g. client-side sort). */
export function patchQueryResultSettings(
    queryId: QueryItem['id'],
    resultIndex = 0,
    settings: Partial<QueryResultReadyState['settings']>,
): ThunkAction<void, RootState, unknown, QueryResultsActions> {
    return (dispatch) => {
        dispatch({
            type: SET_QUERY_RESULTS_SETTINGS,
            data: {
                queryId,
                index: resultIndex,
                settings,
            },
        });
    };
}

async function attachExistenceToFullResult(fullResult: QueryResultMeta['full_result']) {
    if (!fullResult) return undefined;

    const items = Array.isArray(fullResult) ? fullResult : [fullResult];
    const existence = await Promise.all(
        items.map(async ({cluster, table_path}) => {
            try {
                const proxy = getClusterProxy(getClusterConfigByName(cluster));
                return await ytApiV3.exists({
                    setup: {proxy},
                    parameters: {
                        path: `//${table_path}`,
                    },
                });
            } catch {
                return false;
            }
        }),
    );

    return Array.isArray(fullResult)
        ? fullResult.map((item, i) => {
              return {
                  ...item,
                  exist: existence[i],
              };
          })
        : {...fullResult, exist: existence[0]};
}

const QUERY_RESULT_ROWS_LIMIT = 1000;
let nextResultRequestId = 0;

export function loadQueryResult(
    queryId: QueryItem['id'],
    resultIndex = 0,
    {fromStart = false}: {fromStart?: boolean} = {},
): ThunkAction<any, RootState, any, QueryResultsActions> {
    return async (dispatch, getState) => {
        const state = getState();
        const cached = selectQueryResult(state, queryId, resultIndex);
        if (cached && cached.state !== QueryResultState.Error) {
            if (!fromStart) return;
            if (cached.state === QueryResultState.Loading) {
                if (cached.requestOffset === 0) return;
            } else if (cached.resultReady && cached.rowOffset === 0) return;
        }
        const requestId = ++nextResultRequestId;
        try {
            dispatch({
                type: REQUEST_QUERY_RESULTS,
                data: {queryId, index: resultIndex, requestId, rowOffset: 0},
            });
            const meta = await dispatch(getQueryResultMeta(queryId, resultIndex));
            if (meta?.error) throw meta.error;

            if (meta.full_result) {
                meta.full_result = await attachExistenceToFullResult(meta.full_result);
            }

            await dispatch(waitForFontFamilies(null));
            const typeMap = selectPrimitiveTypesMap(getState());
            const scheme = (ypath.getValue(meta?.schema) as QueryResultMetaScheme[]) || [];
            const columns =
                scheme.map(({name, type_v3}) => {
                    return {
                        name,
                        type: getSchemaDateType(parseV3Type(type_v3 as Type, typeMap)),
                        displayName: name,
                    };
                }) || [];

            const settings = cached?.settings || selectQueryResultGlobalSettings();
            const result = await wrapApiPromiseByToaster(
                dispatch(
                    readQueryResults({
                        query_id: queryId,
                        result_index: resultIndex,
                        cursor: {
                            start: 0,
                            end: QUERY_RESULT_ROWS_LIMIT,
                        },
                        columns: columns.map(({name}) => name),
                        settings: {cellsSize: settings.cellSize},
                    }),
                ),
                {
                    toasterName: 'load_result',
                    skipSuccessToast: true,
                    errorTitle: 'Failed to load query result',
                },
            );

            const sourceRows = prepareSourceRows(result);
            dispatch({
                type: SET_QUERY_RESULTS,
                data: {
                    queryId,
                    index: resultIndex,
                    requestId,
                    results: sourceRows,
                    columns,
                    meta,
                },
            });
        } catch (e) {
            dispatch({
                type: SET_QUERY_RESULTS_ERROR,
                data: {
                    queryId,
                    index: resultIndex,
                    requestId,
                    error: e as Error,
                },
            });
        }
    };
}

export function loadNextQueryResult(
    queryId: string,
    resultIndex: number,
): ThunkAction<Promise<void>, RootState, unknown, QueryResultsActions> {
    return async (dispatch, getState) => {
        const previous = selectQueryResult(getState(), queryId, resultIndex);
        if (previous?.state !== QueryResultState.Ready || previous.rowOffset !== 0) return;
        const start = previous.results.length;
        if (start >= previous.meta.data_statistics.row_count) return;

        const requestId = ++nextResultRequestId;
        dispatch({
            type: REQUEST_QUERY_RESULTS,
            data: {queryId, index: resultIndex, requestId, rowOffset: 0},
        });
        try {
            const next = await wrapApiPromiseByToaster(
                dispatch(
                    readQueryResults({
                        query_id: queryId,
                        result_index: resultIndex,
                        cursor: {start, end: start + QUERY_RESULT_ROWS_LIMIT},
                        columns: previous.columns.map(({name}) => name),
                        settings: {cellsSize: previous.settings.cellSize},
                    }),
                ),
                {
                    toasterName: `load_result_page_${queryId}_${resultIndex}`,
                    skipSuccessToast: true,
                    errorTitle: executionI18n('alert_load-result-error'),
                },
            );
            const current = selectQueryResult(getState(), queryId, resultIndex);
            if (!current?.resultReady || current.requestId !== requestId) return;
            const rows = prepareSourceRows(next, start);
            dispatch({
                type: SET_QUERY_RESULTS_PAGE,
                data: {
                    queryId,
                    index: resultIndex,
                    page: 0,
                    rowOffset: 0,
                    requestId,
                    results: [...current.results, ...rows],
                },
            });
        } catch {
            const current = selectQueryResult(getState(), queryId, resultIndex);
            if (!current?.resultReady || current.requestId !== requestId) return;
            dispatch({
                type: SET_QUERY_RESULTS_PAGE,
                data: {
                    queryId,
                    index: resultIndex,
                    page: current.page,
                    rowOffset: current.rowOffset,
                    requestId,
                    results: current.results,
                },
            });
        }
    };
}

export function injectQueryResults({
    queryId,
    resultIndex,
    rowIndex,
    columnName,
    data,
    expectedCell,
}: {
    queryId: string;
    resultIndex: number;
    rowIndex: number;
    columnName: string;
    data: QueryResult;
    expectedCell?: SourceCell;
}): ThunkAction<void, RootState, unknown, QueryResultsActions> {
    return (dispatch) => {
        const cellData = prepareSourceRows(data, rowIndex, true)[0]?.cells[columnName];
        if (!cellData) return;

        dispatch({
            type: SET_QUERY_RESULTS_CELL_DATA,
            data: {
                queryId,
                resultIndex,
                rowIndex,
                columnName,
                cellData,
                expectedCell,
            },
        });
    };
}

export function updateQueryResult(
    queryId: QueryItem['id'],
    resultIndex = 0,
    page: number,
): ThunkAction<any, RootState, any, QueryResultsActions> {
    return async (dispatch, getState) => {
        const requestId = ++nextResultRequestId;
        try {
            const settings = selectQueryResultSettings(getState(), queryId, resultIndex);
            dispatch({
                type: REQUEST_QUERY_RESULTS,
                data: {queryId, index: resultIndex, requestId, rowOffset: page * settings.pageSize},
            });

            const startPage = page * settings.pageSize;
            const endPage = startPage + settings.pageSize;
            const cols =
                (await dispatch(getQueryResultMeta(queryId, resultIndex)))?.schema.$value ?? [];
            const result = await wrapApiPromiseByToaster(
                dispatch(
                    readQueryResults({
                        query_id: queryId,
                        result_index: resultIndex,
                        cursor: {
                            start: page * settings.pageSize,
                            end: endPage,
                        },
                        columns: cols.map(({name}) => name),
                        settings: {cellsSize: settings.cellSize},
                    }),
                ),
                {
                    toasterName: `load_result_page_${page}`,
                    skipSuccessToast: true,
                    errorTitle: `Failed to load query result #${page}`,
                },
            );

            if (Array.isArray(result.rows)) {
                const sourceRows = prepareSourceRows(result, startPage);
                dispatch({
                    type: SET_QUERY_RESULTS_PAGE,
                    data: {
                        queryId,
                        index: resultIndex,
                        results: sourceRows,
                        page,
                        rowOffset: startPage,
                        requestId,
                    },
                });
            }
        } catch (e) {
            dispatch({
                type: SET_QUERY_RESULTS_ERROR,
                data: {
                    queryId,
                    index: resultIndex,
                    requestId,
                    error: e as Error,
                },
            });
        }
    };
}

export function loadQueryResultsErrors(
    query: QueryItem,
): ThunkAction<any, RootState, any, QueryResultsActions> {
    return async (dispatch, getState) => {
        const state = getState();
        const {result_count} = query;

        if (!result_count) return;

        const inds: number[] = [];
        for (let ind = 0; ind < result_count; ind++) {
            if (!selectHasQueryResult(state, query.id, ind)) inds.push(ind);
        }

        if (inds.length === 0) return;

        try {
            const results = await wrapApiPromiseByToaster(
                dispatch(getQueryResultMetaList(query.id, inds)),
                {
                    toasterName: `load_query_results`,
                    skipSuccessToast: true,
                    errorTitle: `Failed to load query results meta`,
                },
            );
            const resultsErrors: {[index: number]: QueryResultErrorState} = {};
            forEach_(results, ({output: meta, error}, ind: number) => {
                const e = error || meta?.error;
                if (e) {
                    resultsErrors[ind] = {
                        error: e as Error,
                        state: QueryResultState.Error,
                        resultReady: false,
                    };
                }
            });
            dispatch({
                type: SET_QUERY_RESULTS_ERRORS,
                data: {queryId: query.id, errors: resultsErrors},
            });
        } catch (e) {}
    };
}
