import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import {ActionD} from '../../../../types';
import {
    QueryItem,
    QueryResultMetaScheme,
    getQueryResultMeta,
    getQueryResultMetaList,
    readQueryResults,
} from '../api';
import {getType} from '../../../../components/SchemaDataType/dataTypes';
import {getQueryResultGlobalSettings, getQueryResultSettings, hasQueryResult} from './selectors';
import {QueryResultErrorState, QueryResultReadyState, QueryResultState} from './types';
import {prepareFormattedValue} from './utils/format';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {getPrimitiveTypesMap} from '../../../../store/selectors/global/supported-features';
import {Type, parseV3Type} from '../../../../components/SchemaDataType/dateTypesV3';
import ypath from '../../../../common/thor/ypath';
import forEach_ from 'lodash/forEach';
import {waitForFontFamilies} from '../../../../store/actions/global/fonts';

export const REQUEST_QUERY_RESULTS = 'query-tracker/REQUEST_QUERY_RESULTS';
export type RequestQueryResultsAction = ActionD<
    typeof REQUEST_QUERY_RESULTS,
    {
        queryId: QueryItem['id'];
        index: number;
    }
>;

// To create initial result
export const SET_QUERY_RESULTS = 'query-tracker/SET_QUERY_RESULTS';
export type SetQueryResultsAction = ActionD<
    typeof SET_QUERY_RESULTS,
    {
        queryId: QueryItem['id'];
        index: number;
        results: QueryResultReadyState['results'];
        columns: QueryResultReadyState['columns'];
        meta?: QueryResultReadyState['meta'];
    }
>;

export const SET_QUERY_RESULTS_PAGE = 'query-tracker/SET_QUERY_RESULTS_PAGE';
export type SetQueryResultsPageAction = ActionD<
    typeof SET_QUERY_RESULTS_PAGE,
    {
        queryId: QueryItem['id'];
        index: number;
        results: QueryResultReadyState['results'];
        page: number;
    }
>;

export const SET_QUERY_RESULTS_ERROR = 'query-tracker/SET_QUERY_RESULTS_ERROR';
export type SetQueryResultsErrorAction = ActionD<
    typeof SET_QUERY_RESULTS_ERROR,
    {
        queryId: QueryItem['id'];
        index: number;
        error: Error;
    }
>;

export const SET_QUERY_RESULTS_ERRORS = 'query-tracker/SET_QUERY_RESULTS_ERRORS';
export type SetQueryResultsErrorsAction = ActionD<
    typeof SET_QUERY_RESULTS_ERRORS,
    {queryId: QueryItem['id']; errors: {[index: number]: QueryResultErrorState}}
>;

export const SET_QUERY_RESULTS_SETTINGS = 'query-tracker/SET_QUERY_RESULTS_SETTINGS';
export type SetQueryResultsSettingsAction = ActionD<
    typeof SET_QUERY_RESULTS_SETTINGS,
    {
        queryId: QueryItem['id'];
        index: number;
        settings: Partial<QueryResultReadyState['settings']>;
    }
>;

export type QueryResultsActions =
    | RequestQueryResultsAction
    | SetQueryResultsAction
    | SetQueryResultsErrorAction
    | SetQueryResultsSettingsAction
    | SetQueryResultsPageAction
    | SetQueryResultsErrorsAction;

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

            await dispatch(waitForFontFamilies(null));
            const typeMap = getPrimitiveTypesMap(getState());
            const scheme = (ypath.getValue(meta?.schema) as QueryResultMetaScheme[]) || [];
            const columns =
                scheme.map(({name, type_v3}) => {
                    return {
                        name,
                        type: getType(parseV3Type(type_v3 as Type, typeMap)),
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
                    {} as Record<string, {$type: string; $value: unknown}>,
                );
            });
            dispatch({
                type: SET_QUERY_RESULTS,
                data: {
                    queryId,
                    index: resultIndex,
                    results: formattedResult,
                    columns: columns,
                    meta: meta,
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
                    {} as Record<string, {$type: string; $value: unknown}>,
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
