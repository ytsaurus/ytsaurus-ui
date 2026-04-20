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
    getQueryResultGlobalSettings,
    getQueryResultSettings,
    hasQueryResult,
} from '../../selectors/query-tracker/queryResult';
import {getClusterConfigByName, getClusterProxy} from '../../selectors/global';
import {
    type QueryResultErrorState,
    type QueryResultReadyState,
    QueryResultState,
    type Result,
} from '../../../types/query-tracker/queryResult';
import {prepareFormattedValue} from '../../../utils/queries/format';
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

export function loadQueryResult(
    queryId: QueryItem['id'],
    resultIndex = 0,
): ThunkAction<any, RootState, any, QueryResultsActions> {
    return async (dispatch, getState) => {
        const state = getState();
        if (hasQueryResult(state, queryId, resultIndex)) {
            return;
        }
        try {
            dispatch({
                type: REQUEST_QUERY_RESULTS,
                data: {queryId, index: resultIndex},
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

            const settings = getQueryResultGlobalSettings();
            const result = await wrapApiPromiseByToaster(
                dispatch(
                    readQueryResults(
                        queryId,
                        resultIndex,
                        {
                            start: 0,
                            end: settings.pageSize,
                        },
                        columns.map(({name}) => name),
                        {cellsSize: settings.cellSize},
                    ),
                ),
                {
                    toasterName: 'load_result',
                    skipSuccessToast: true,
                    errorTitle: 'Failed to load query result',
                },
            );

            const {rows, yql_type_registry: types} = result;

            const formattedResult = rows.map((v) => {
                return Object.entries(v).reduce(
                    (acc, [k, [value, typeIndex]]) => {
                        acc[k] = prepareFormattedValue(value, types[Number(typeIndex)]);
                        return acc;
                    },
                    {} as Record<string, Result>,
                );
            });
            dispatch({
                type: SET_QUERY_RESULTS,
                data: {
                    queryId,
                    index: resultIndex,
                    results: formattedResult,
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
                    error: e as Error,
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
}: {
    queryId: string;
    resultIndex: number;
    rowIndex: number;
    columnName: string;
    data: QueryResult;
}): ThunkAction<void, RootState, unknown, QueryResultsActions> {
    return (dispatch) => {
        const {rows, yql_type_registry: types} = data;

        const [value, typeIndex] = rows[0][columnName];
        const cellData = prepareFormattedValue(value, types[Number(typeIndex)], {
            maxListSize: undefined,
            maxStringSize: undefined,
            treatValAsData: true,
        });

        dispatch({
            type: SET_QUERY_RESULTS_CELL_DATA,
            data: {
                queryId,
                resultIndex,
                rowIndex,
                columnName,
                cellData,
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
        try {
            const settings = getQueryResultSettings(getState(), queryId, resultIndex);
            dispatch({
                type: REQUEST_QUERY_RESULTS,
                data: {queryId, index: resultIndex},
            });

            const startPage = page * settings.pageSize;
            const endPage = startPage + settings.pageSize;
            const cols =
                (await dispatch(getQueryResultMeta(queryId, resultIndex)))?.schema.$value ?? [];
            const result = await wrapApiPromiseByToaster(
                dispatch(
                    readQueryResults(
                        queryId,
                        resultIndex,
                        {
                            start: page * settings.pageSize,
                            end: endPage,
                        },
                        cols.map(({name}) => name),
                        {cellsSize: settings.cellSize},
                    ),
                ),
                {
                    toasterName: `load_result_page_${page}`,
                    skipSuccessToast: true,
                    errorTitle: `Failed to load query result #${page}`,
                },
            );

            const {rows, yql_type_registry: types} = result;

            const formattedResult = result.rows.map((v) => {
                return Object.entries(v).reduce(
                    (acc, [k, [value, typeIndex]]) => {
                        acc[k] = prepareFormattedValue(value, types[Number(typeIndex)]);
                        return acc;
                    },
                    {} as Record<string, Result>,
                );
            });

            if (Array.isArray(rows) && rows.length) {
                dispatch({
                    type: SET_QUERY_RESULTS_PAGE,
                    data: {
                        queryId,
                        index: resultIndex,
                        results: formattedResult,
                        settings,
                        page,
                    },
                });
            }
        } catch (e) {
            dispatch({
                type: SET_QUERY_RESULTS_ERROR,
                data: {
                    queryId,
                    index: resultIndex,
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
            if (!hasQueryResult(state, query.id, ind)) inds.push(ind);
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
