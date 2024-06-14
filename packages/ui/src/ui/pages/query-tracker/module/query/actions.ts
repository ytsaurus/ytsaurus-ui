import {createQueryUrl} from '../../utils/navigation';
import {Action, AnyAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import {getCluster} from '../../../../store/selectors/global';
import {ActionD} from '../../../../types';
import {QueryEngine} from '../engines';
import {
    QueryItem,
    abortQuery,
    addACOToLastSelected,
    generateQueryFromTable,
    getQuery,
    startQuery,
    updateACOQuery,
} from '../api';
import {requestQueriesList} from '../queries_list/actions';
import {getCurrentQuery, getQueryDraft} from './selectors';
import {getAppBrowserHistory} from '../../../../store/window-store';
import {QueryState} from './reducer';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {prepareQueryPlanIds} from './utills';
import {chytApiAction} from '../../../../utils/api';
import guid from '../../../../common/hammer/guid';

export const REQUEST_QUERY = 'query-tracker/REQUEST_QUERY';
export type RequestQueryAction = Action<typeof REQUEST_QUERY>;

export const SET_QUERY_READY = 'query-tracker/SET_QUERY_READY';
export type SetQueryReadyAction = Action<typeof SET_QUERY_READY>;

export const SET_QUERY = 'query-tracker/SET_QUERY';
export type SetQueryAction = ActionD<
    typeof SET_QUERY,
    {
        initialQuery?: QueryItem;
        draftText?: string;
    }
>;

export const UPDATE_QUERY = 'query-tracker/UPDATE_QUERY';
export type UpdateQueryAction = ActionD<typeof UPDATE_QUERY, QueryItem>;

export const SET_QUERY_LOAD_ERROR = 'query-tracker/SET_QUERY_LOAD_ERROR';
export type SetQueryErrorLoadAction = ActionD<typeof SET_QUERY_LOAD_ERROR, Error | string>;

export const SET_QUERY_PATCH = 'query-tracker/SET_QUERY_PATCH';
export type SetQueryPatchAction = ActionD<typeof SET_QUERY_PATCH, QueryState['draft']>;

export const SET_QUERY_PARAMS = 'query-tracker/SET_QUERY_PARAMS';
export type SetQueryParamsAction = ActionD<
    typeof SET_QUERY_PARAMS,
    Partial<Pick<QueryState, 'params'>>
>;

export const SET_QUERY_CLIQUE_LOADING = 'query-tracker/SET_QUERY_CLIQUE_LOADING';
export type SetQueryCliqueLoading = ActionD<typeof SET_QUERY_CLIQUE_LOADING, boolean>;

export const SET_QUERY_CLUSTER_CLIQUE = 'query-tracker/SET_QUERY_CLUSTER_CLIQUE';
export type SetQueryClusterClique = ActionD<
    typeof SET_QUERY_CLUSTER_CLIQUE,
    {cluster: string; items: {alias: string; yt_operation_id?: string}[]}
>;

export const UPDATE_ACO_QUERY = 'query-tracker/UPDATE_ACO_QUERY';
export type UpdateACOQueryAction = ActionD<typeof UPDATE_ACO_QUERY, string>;

export const setCurrentClusterToQuery =
    (): ThunkAction<void, RootState, unknown, any> => (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const {settings} = getQueryDraft(state);

        if (settings && 'cluster' in settings) return;

        dispatch(updateQueryDraft({settings: {...settings, cluster}}));
    };

export const loadCliqueByCluster =
    (
        cluster: string,
    ): ThunkAction<void, RootState, unknown, SetQueryClusterClique | SetQueryCliqueLoading> =>
    (dispatch, getState) => {
        const state = getState();
        if (cluster in state.queryTracker.query.cliqueMap) return;

        dispatch({type: SET_QUERY_CLIQUE_LOADING, data: true});
        chytApiAction('list', cluster, {attributes: ['yt_operation_id' as const]}, {})
            .then((data) => {
                const items = data?.result?.map(({$value, $attributes = {}}) => {
                    return {
                        alias: $value,
                        yt_operation_id: $attributes.yt_operation_id,
                    };
                });

                dispatch({
                    type: SET_QUERY_CLUSTER_CLIQUE,
                    data: {cluster, items},
                });
            })
            .catch(() => {
                dispatch({
                    type: SET_QUERY_CLUSTER_CLIQUE,
                    data: {cluster, items: []},
                });
            })
            .finally(() => {
                dispatch({type: SET_QUERY_CLIQUE_LOADING, data: false});
            });
    };

export function loadQuery(
    queryId: string,
    config?: {dontReplaceQueryText?: boolean},
): ThunkAction<any, RootState, any, SetQueryAction | RequestQueryAction | SetQueryErrorLoadAction> {
    return async (dispatch, getState) => {
        const state = getState();
        dispatch({type: REQUEST_QUERY});
        try {
            const query = await wrapApiPromiseByToaster(dispatch(getQuery(queryId)), {
                toasterName: 'load_query',
                skipSuccessToast: true,
                errorTitle: 'Failed to load query',
            });

            query.files = query.files.map((file) => ({...file, id: guid()}));

            if (query.engine === QueryEngine.CHYT && query.settings?.cluster) {
                dispatch(loadCliqueByCluster(query.settings.cluster as string));
            }

            const queryItem = prepareQueryPlanIds(query);

            if (config?.dontReplaceQueryText) {
                queryItem.query = state.queryTracker.query.draft.query;
            }

            dispatch({
                type: SET_QUERY,
                data: {
                    initialQuery: queryItem,
                },
            });
        } catch (e: unknown) {
            dispatch(createEmptyQuery());
        } finally {
            dispatch(setCurrentClusterToQuery());
        }
    };
}

export function updateQueryDraft(data: Partial<QueryState['draft']>) {
    return {type: SET_QUERY_PATCH, data};
}

export function createQueryFromTablePath(
    engine: QueryEngine,
    cluster: string,
    path: string,
    options?: {useDraft?: boolean},
): ThunkAction<
    any,
    RootState,
    any,
    | SetQueryAction
    | RequestQueryAction
    | SetQueryErrorLoadAction
    | SetQueryPatchAction
    | UpdateQueryAction
    | SetQueryReadyAction
> {
    return async (dispatch) => {
        dispatch({type: REQUEST_QUERY});
        try {
            const draft = await wrapApiPromiseByToaster(
                generateQueryFromTable(engine, {cluster, path}),
                {
                    toasterName: 'load_query',
                    skipSuccessToast: true,
                    errorTitle: 'Failed to load query',
                },
            );
            if (draft) {
                if (options?.useDraft) {
                    dispatch({
                        type: UPDATE_QUERY,
                        data: draft as QueryItem,
                    });
                    dispatch({type: SET_QUERY_READY});
                } else {
                    dispatch({
                        type: SET_QUERY,
                        data: {
                            initialQuery: draft as QueryItem,
                        },
                    });
                }
            } else {
                dispatch(createEmptyQuery(engine));
            }
        } catch (e) {
            dispatch(createEmptyQuery(engine));
        }
    };
}

export function createEmptyQuery(
    engine = QueryEngine.YQL,
    query?: string,
    settings?: Record<string, string>,
): ThunkAction<any, RootState, any, SetQueryAction> {
    return (dispatch) => {
        dispatch({
            type: SET_QUERY,
            data: {
                initialQuery: {
                    query: query || '',
                    engine,
                    settings: settings || {},
                } as QueryItem,
            },
        });
        dispatch(setCurrentClusterToQuery());
    };
}

export function runQuery(
    afterCreate?: (query_id: string) => boolean | void,
    options?: {execution_mode: 'validate' | 'optimize'},
): ThunkAction<any, RootState, any, SetQueryAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const query = getQueryDraft(state);
        const {query_id} = await wrapApiPromiseByToaster(dispatch(startQuery(query, options)), {
            toasterName: 'start_query',
            skipSuccessToast: true,
            errorTitle: 'Failed to start query',
        });
        const handled = afterCreate?.(query_id);
        if (!handled) {
            dispatch(loadQuery(query_id));
        }
        dispatch(requestQueriesList());
    };
}

export function abortCurrentQuery(): ThunkAction<any, RootState, any, SetQueryAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const currentQuery = getCurrentQuery(state);
        if (currentQuery) {
            await wrapApiPromiseByToaster(dispatch(abortQuery({query_id: currentQuery?.id})), {
                toasterName: 'abort_query',
                skipSuccessToast: true,
                errorTitle: 'Failed to abort query',
            });
            dispatch(loadQuery(currentQuery?.id, {dontReplaceQueryText: true}));
            dispatch(requestQueriesList());
        }
    };
}

export function goToQuery(query_id: string): ThunkAction<any, RootState, any, never> {
    return (_, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const history = getAppBrowserHistory();
        history.push(createQueryUrl(cluster, query_id));
    };
}

export function resetQueryTracker(): ThunkAction<any, RootState, any, never> {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const history = getAppBrowserHistory();

        history.push(createQueryUrl(cluster, ''));

        dispatch(createEmptyQuery());
    };
}

export function setQueryACO({
    aco,
    query_id,
}: {
    aco: string;
    query_id: string;
}): ThunkAction<Promise<unknown>, RootState, any, AnyAction> {
    return (dispatch) => {
        return wrapApiPromiseByToaster(dispatch(updateACOQuery({query_id, aco})), {
            toasterName: 'update_aco_query',
            skipSuccessToast: true,
            errorTitle: 'Failed to update query ACO',
        }).then(() => {
            dispatch({type: UPDATE_ACO_QUERY, data: aco});
        });
    };
}

export function setDraftQueryACO({
    aco,
}: {
    aco: string;
}): ThunkAction<Promise<unknown>, RootState, any, AnyAction> {
    return (dispatch) => {
        return dispatch(addACOToLastSelected(aco)).then(() =>
            dispatch(updateQueryDraft({access_control_object: aco})),
        );
    };
}
