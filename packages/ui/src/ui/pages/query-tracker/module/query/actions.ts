import {createQueryUrl} from '../../utils/navigation';
import {AnyAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import {getCliqueControllerIsSupported, getCluster} from '../../../../store/selectors/global';
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
import {
    SHARED_QUERY_ACO,
    getCurrentQuery,
    getQueryDraft,
    getQuery as selectQuery,
} from './selectors';
import {getAppBrowserHistory} from '../../../../store/window-store';
import type {
    QueryState,
    RequestQueryAction,
    SetQueryAction,
    SetQueryCliqueLoading,
    SetQueryClusterClique,
    SetQueryErrorLoadAction,
    SetQueryPatchAction,
    SetQueryReadyAction,
    UpdateQueryAction,
} from './reducer';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {prepareQueryPlanIds} from './utills';
import {chytApiAction, spytApiAction} from '../../../../utils/strawberryControllerApi';
import guid from '../../../../common/hammer/guid';
import {getSettingQueryTrackerStage} from '../../../../store/selectors/settings-ts';
import {getDefaultQueryACO, selectIsMultipleAco} from '../query_aco/selectors';

import {
    REQUEST_QUERY,
    SET_QUERY,
    SET_QUERY_CLIQUE_LOADING,
    SET_QUERY_CLUSTER_CLIQUE,
    SET_QUERY_PATCH,
    SET_QUERY_READY,
    UPDATE_ACO_QUERY,
    UPDATE_QUERY,
} from '../query-tracker-contants';

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
        engine: QueryEngine.SPYT | QueryEngine.CHYT,
        cluster: string,
    ): ThunkAction<void, RootState, unknown, SetQueryClusterClique | SetQueryCliqueLoading> =>
    (dispatch, getState) => {
        const state = getState();
        const isSpyt = engine === QueryEngine.SPYT;

        if (
            cluster in state.queryTracker.query.cliqueMap &&
            state.queryTracker.query.cliqueMap[cluster][engine]
        )
            return;

        const supportedControllers = getCliqueControllerIsSupported(state);
        if ((isSpyt && !supportedControllers.spyt) || (!isSpyt && !supportedControllers.chyt))
            return; // Clique selector is not supported on cluster

        dispatch({type: SET_QUERY_CLIQUE_LOADING, data: true});
        const apiAction = isSpyt ? spytApiAction : chytApiAction;
        apiAction('list', cluster, {attributes: ['yt_operation_id' as const]}, {})
            .then((data) => {
                const items = data?.result?.map(({$value, $attributes = {}}) => {
                    return {
                        alias: $value,
                        yt_operation_id: $attributes.yt_operation_id,
                    };
                });

                dispatch({
                    type: SET_QUERY_CLUSTER_CLIQUE,
                    data: {cluster, engine, items},
                });
            })
            .catch(() => {
                dispatch({
                    type: SET_QUERY_CLUSTER_CLIQUE,
                    data: {cluster, engine, items: []},
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
        const stage = getSettingQueryTrackerStage(state);
        dispatch({type: REQUEST_QUERY});
        try {
            const query = await wrapApiPromiseByToaster(dispatch(getQuery(queryId)), {
                toasterName: 'load_query',
                skipSuccessToast: true,
                errorContent: (error) => {
                    const {code, message} = error;
                    return `[code ${code}]: ${message}${stage ? `. Your stage is set to "${stage}". Reset it and try again` : ''}`;
                },
                errorTitle: `Failed to load query ${stage ? `[stage: ${stage}]` : ''}`,
            });

            query.files = query.files.map((file) => ({...file, id: guid()}));
            const defaultQueryACO = getDefaultQueryACO(state);
            const queryItem = prepareQueryPlanIds(query, defaultQueryACO);

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
    return async (dispatch, getState) => {
        dispatch({type: REQUEST_QUERY});
        try {
            const state = getState();
            const defaultQueryACO = getDefaultQueryACO(state);
            const draft = await wrapApiPromiseByToaster(
                generateQueryFromTable(engine, {cluster, path, defaultQueryACO}),
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
    return (dispatch, getState) => {
        const state = getState();
        const defaultQueryACO = getDefaultQueryACO(state);

        dispatch({
            type: SET_QUERY,
            data: {
                initialQuery: {
                    access_control_object: defaultQueryACO,
                    access_control_objects: [defaultQueryACO],
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

        const newQuery = {...query};
        if ('access_control_objects' in newQuery) {
            newQuery.access_control_objects = newQuery.access_control_objects?.filter(
                (i) => i !== SHARED_QUERY_ACO,
            );
        }

        const {query_id} = await wrapApiPromiseByToaster(dispatch(startQuery(newQuery, options)), {
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
    aco: string[];
    query_id: string;
}): ThunkAction<Promise<unknown>, RootState, any, AnyAction> {
    return (dispatch, getState) => {
        const isMultipleAco = selectIsMultipleAco(getState());
        return wrapApiPromiseByToaster(dispatch(updateACOQuery({query_id, aco})), {
            toasterName: 'update_aco_query',
            skipSuccessToast: true,
            errorTitle: 'Failed to update query ACO',
        }).then(() => {
            dispatch({
                type: UPDATE_ACO_QUERY,
                data: isMultipleAco
                    ? {access_control_objects: aco}
                    : {access_control_object: aco[0]},
            });
        });
    };
}

export function setDraftQueryACO({
    aco,
}: {
    aco: string[];
}): ThunkAction<Promise<unknown>, RootState, any, AnyAction> {
    return (dispatch, getState) => {
        const isMultipleAco = selectIsMultipleAco(getState());
        return dispatch(addACOToLastSelected(aco)).then(() =>
            dispatch(
                updateQueryDraft(
                    isMultipleAco ? {access_control_objects: aco} : {access_control_object: aco[0]},
                ),
            ),
        );
    };
}

export const toggleShareQuery =
    (): ThunkAction<unknown, RootState, any, AnyAction> => async (dispatch, getState) => {
        const state = getState();
        const query = selectQuery(state);
        if (!query) return;

        const defaultQueryACO = getDefaultQueryACO(state);
        let aco = query.access_control_objects || [defaultQueryACO];

        if (aco.includes(SHARED_QUERY_ACO)) {
            aco = aco.filter((i) => i !== SHARED_QUERY_ACO);
            if (!aco.length) aco = [defaultQueryACO];
        } else {
            aco = [...aco, SHARED_QUERY_ACO];
        }

        await dispatch(updateACOQuery({aco, query_id: query.id}));
        await dispatch(requestQueriesList());
        dispatch({
            type: UPDATE_ACO_QUERY,
            data: {access_control_objects: aco},
        });
    };
