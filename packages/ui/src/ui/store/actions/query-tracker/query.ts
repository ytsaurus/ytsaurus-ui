import {createQueryUrl} from '../../../pages/query-tracker/utils/navigation';
import {AnyAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {getCluster} from '../../selectors/global';
import {QueryEngine} from '../../../../shared/constants/engines';
import {
    DraftQuery,
    QueryItem,
    abortQuery,
    addACOToLastSelected,
    generateQueryFromTable,
    getQuery,
    startQuery,
    updateACOQuery,
} from './api';
import {requestQueriesList} from './queriesList';
import {
    SHARED_QUERY_ACO,
    getCliqueMap,
    getCurrentQuery,
    getQueryDraft,
    getQueryDraftSettings,
    getQueryEngine,
    getQuery as selectQuery,
} from '../../selectors/query-tracker/query';
import {getAppBrowserHistory} from '../../window-store';
import {
    QueryState,
    RequestQueryAction,
    SetDirtySubmit,
    SetQueryAction,
    SetQueryCliqueLoading,
    SetQueryClusterClique,
    SetQueryClusterLoading,
    SetQueryErrorLoadAction,
    SetQueryPatchAction,
    SetQueryReadyAction,
    UpdateDraftAction,
} from '../../reducers/query-tracker/query';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {prepareQueryPlanIds} from '../../../types/query-tracker/query';
import {chytApiAction, spytApiAction} from '../../../utils/strawberryControllerApi';
import guid from '../../../common/hammer/guid';
import {getSettingQueryTrackerStage} from '../../selectors/settings/settings-ts';
import {
    getDefaultQueryACO,
    getDefaultYqlVersion,
    selectIsMultipleAco,
} from '../../selectors/query-tracker/queryAco';
import UIFactory from '../../../UIFactory';

import {
    REQUEST_QUERY,
    SET_DIRTY_SUBMIT,
    SET_QUERY,
    SET_QUERY_CLIQUE_LOADING,
    SET_QUERY_CLUSTER_CLIQUE,
    SET_QUERY_CLUSTER_LOADING,
    SET_QUERY_PATCH,
    SET_QUERY_READY,
    SET_SUPPORTED_ENGINE,
    UPDATE_ACO_QUERY,
    UPDATE_DRAFT,
} from '../../reducers/query-tracker/query-tracker-contants';
import {loadVisualization} from './queryChart';
import {ChytInfo} from '../../reducers/chyt/list';
import {
    getLastUserChoiceQueryChytClique,
    getLastUserChoiceQueryDiscoveryPath,
    getLastUserChoiceQueryEngine,
    getLastUserChoiceYqlVersion,
} from '../../selectors/settings/settings-queries';

import {getClusterParams, prepareClusterUiConfig} from '../cluster-params';
import {RumWrapper} from '../../../rum/rum-wrap-api';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {ClusterUiConfig} from '../../../../shared/yt-types';
import {setSettingByKey} from '../settings';
import {selectClusterConfigs} from '../../selectors/query-tracker/queryNavigation';
import {getQueryResultGlobalSettings} from '../../selectors/query-tracker/queryResult';
import {createTableSelect} from '../../../pages/query-tracker/Navigation/helpers/createTableSelect';
import {ResetQueryTabsAction, resetQueryTabs} from '../../reducers/query-tracker/queryTabsSlice';
import {updateQueryTabs} from './queryTabs/queryTabs';

type AsyncAction = ThunkAction<void, RootState, unknown, any>;

const checkCliqueControllerIsSupported =
    (clusterId: string, engine: QueryEngine): AsyncAction =>
    async (dispatch) => {
        const supportedControllers = await getCliqueControllerSupportByCluster(clusterId);

        if (
            (engine === QueryEngine.SPYT && !supportedControllers.spyt) ||
            (engine === QueryEngine.CHYT && !supportedControllers.chyt)
        ) {
            dispatch(updateQueryDraft({engine: QueryEngine.YQL}));
        }

        dispatch({
            type: SET_SUPPORTED_ENGINE,
            data: supportedControllers,
        });
    };

export const setCurrentClusterToQuery = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const cluster = getCluster(state);
    const {settings, engine} = getQueryDraft(state);

    if (settings && 'cluster' in settings) return;

    dispatch(checkCliqueControllerIsSupported(cluster, engine));
    dispatch(updateQueryDraft({settings: {...settings, cluster}}));
};

export const setUserLastChoice =
    (clearProps?: boolean): AsyncAction =>
    (dispatch, getState) => {
        const state = getState();
        const {settings} = getQueryDraft(state);
        const engine = getQueryEngine(state);
        const lastPath = getLastUserChoiceQueryDiscoveryPath(state);
        const lastClique = getLastUserChoiceQueryChytClique(state);
        const lastVersion = getLastUserChoiceYqlVersion(state);
        const defaultYqlVersion = getDefaultYqlVersion(state);

        const newSettings = {...settings};
        if (clearProps) {
            delete newSettings.discovery_group;
            delete newSettings.clique;
        }

        if (engine === QueryEngine.SPYT && lastPath) {
            newSettings.discovery_group = lastPath;
        }

        if (engine === QueryEngine.CHYT && lastClique) {
            newSettings.clique = lastClique;
        }

        if (engine === QueryEngine.YQL && !settings?.yql_version) {
            const yqlVersion = lastVersion || defaultYqlVersion;
            if (yqlVersion) {
                newSettings.yql_version = yqlVersion;
            }
        }

        dispatch(updateQueryDraft({settings: newSettings}));
    };

const getCliqueControllerSupportByCluster = async (
    cluster: string,
): Promise<QueryState['draft']['supportedEngines']> => {
    if (!cluster) {
        return {
            spyt: false,
            chyt: false,
            yql: true,
            ql: true,
        };
    }

    const rumId = new RumWrapper(cluster, RumMeasureTypes.CLUSTER_PARAMS);
    const {data} = await getClusterParams(rumId, cluster);
    const [uiConfigOutput] = prepareClusterUiConfig(data.uiConfig, data.uiDevConfig) as [
        ClusterUiConfig,
    ];

    return {
        yql: true,
        chyt: Boolean(uiConfigOutput.chyt_controller_base_url),
        spyt: Boolean(uiConfigOutput.livy_controller_base_url),
        ql: true,
    };
};

export const loadTablePromptToQuery =
    (
        cluster: string,
        path: string,
        engine: QueryEngine,
        newQuerySettings?: Record<string, string>,
    ): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const {pageSize} = getQueryResultGlobalSettings();
        const clusters = selectClusterConfigs(state);

        const clusterConfig = clusters[cluster];
        if (!clusterConfig) return;

        const query = await createTableSelect({clusterConfig, path, engine, limit: pageSize});
        dispatch(createEmptyQuery(engine, query, newQuerySettings));
    };

export const setQueryEngine =
    (engine: QueryEngine): AsyncAction =>
    (dispatch, getState) => {
        const settings = getQueryDraftSettings(getState());

        const newSettings = {...settings};
        if (engine !== QueryEngine.SPYT) {
            delete newSettings.discovery_group;
        }

        if (engine !== QueryEngine.CHYT) {
            delete newSettings.clique;
        }

        if (engine !== QueryEngine.YQL) {
            delete newSettings.yql_version;
        }

        dispatch(updateQueryDraft({settings: newSettings}));
    };

export const setQueryCluster =
    (clusterId: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const {settings = {}, engine} = getQueryDraft(state);

        try {
            dispatch({type: SET_QUERY_CLUSTER_LOADING, data: true});
            await dispatch(checkCliqueControllerIsSupported(clusterId, engine));

            const newSettings = {...settings};
            if (clusterId) {
                newSettings.cluster = clusterId;
            } else {
                delete newSettings['cluster'];
            }
            delete newSettings['clique'];

            dispatch(updateQueryDraft({settings: newSettings}));
            dispatch(setUserLastChoice(true));
        } finally {
            dispatch({type: SET_QUERY_CLUSTER_LOADING, data: false});
        }
    };

export const setQueryClique =
    (alias: string): AsyncAction =>
    (dispatch, getState) => {
        const settings = getQueryDraftSettings(getState());

        const newSettings = {...settings};
        if (!alias && 'clique' in newSettings) {
            delete newSettings.clique;
        } else {
            newSettings.clique = alias;
        }
        dispatch(updateQueryDraft({settings: newSettings}));
        dispatch(
            setSettingByKey(`local::${settings?.cluster}::queryTracker::lastChytClique`, alias),
        );
    };

export const setQueryYqlVersion =
    (version: string): AsyncAction =>
    (dispatch, getState) => {
        const settings = getQueryDraftSettings(getState());

        dispatch(updateQueryDraft({settings: {...settings, yql_version: version}}));
        dispatch(
            setSettingByKey(`local::${settings?.cluster}::queryTracker::lastYqlVersion`, version),
        );
    };

export const setQueryPath =
    (newPath: string): AsyncAction =>
    (dispatch, getState) => {
        const settings = getQueryDraftSettings(getState());
        dispatch(updateQueryDraft({settings: {...settings, discovery_group: newPath}}));
        dispatch(
            setSettingByKey(
                `local::${settings?.cluster}::queryTracker::lastDiscoveryPath`,
                newPath,
            ),
        );
    };

export const loadCliqueByCluster =
    (
        engine: QueryEngine.SPYT | QueryEngine.CHYT,
        cluster: string,
    ): ThunkAction<void, RootState, unknown, SetQueryClusterClique | SetQueryCliqueLoading> =>
    async (dispatch, getState) => {
        const isSpyt = engine === QueryEngine.SPYT;
        const cliqueMap = getCliqueMap(getState());

        if (cluster in cliqueMap && cliqueMap[cluster][engine]) return;

        const supportedControllers = await getCliqueControllerSupportByCluster(cluster);

        if ((isSpyt && !supportedControllers.spyt) || (!isSpyt && !supportedControllers.chyt))
            return; // Clique selector is not supported on cluster

        dispatch({type: SET_QUERY_CLIQUE_LOADING, data: true});
        const apiAction = isSpyt ? spytApiAction : chytApiAction;
        apiAction('list', cluster, {attributes: ['yt_operation_id', 'state', 'health']}, {})
            .then((data) => {
                const items = data?.result?.map(({$value, $attributes = {}}) => {
                    const clique: ChytInfo = {
                        alias: $value,
                        yt_operation_id: $attributes.yt_operation_id,
                        state: $attributes.state,
                        health: $attributes.health,
                    };
                    return clique;
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
): ThunkAction<
    any,
    RootState,
    any,
    SetQueryAction | RequestQueryAction | ResetQueryTabsAction | SetQueryErrorLoadAction
> {
    return async (dispatch, getState) => {
        const state = getState();
        const stage = getSettingQueryTrackerStage(state);
        dispatch({type: REQUEST_QUERY});
        dispatch(resetQueryTabs());
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

            UIFactory.getInlineSuggestionsApi()?.onQueryLoad();
            dispatch({
                type: SET_QUERY,
                data: {
                    initialQuery: queryItem,
                },
            });
            dispatch(loadVisualization());
        } catch (e: unknown) {
            dispatch(createEmptyQuery());
        } finally {
            dispatch(setCurrentClusterToQuery());
            dispatch(setUserLastChoice());
            dispatch(updateQueryTabs());
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
    | UpdateDraftAction
    | SetQueryReadyAction
    | SetQueryClusterLoading
> {
    return async (dispatch, getState) => {
        dispatch({type: REQUEST_QUERY});
        dispatch({type: SET_QUERY_CLUSTER_LOADING, data: true});

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
                        type: UPDATE_DRAFT,
                        data: draft,
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
        } finally {
            dispatch(checkCliqueControllerIsSupported(cluster, engine));
            dispatch({type: SET_QUERY_CLUSTER_LOADING, data: false});
        }
    };
}

export function createEmptyQuery(
    engine?: QueryEngine,
    query?: string,
    settings?: Record<string, string>,
): ThunkAction<any, RootState, any, SetQueryAction | ResetQueryTabsAction> {
    return (dispatch, getState) => {
        const state = getState();
        const lastEngine = getLastUserChoiceQueryEngine(state);
        const defaultQueryACO = getDefaultQueryACO(state);

        const initialEngine = engine || lastEngine || QueryEngine.YQL;

        const defaultSettings: DraftQuery['settings'] = {};
        UIFactory.getInlineSuggestionsApi()?.onQueryCreate();
        dispatch({
            type: SET_QUERY,
            data: {
                initialQuery: {
                    access_control_object: defaultQueryACO,
                    access_control_objects: [defaultQueryACO],
                    query: query || '',
                    engine: initialEngine,
                    settings: settings || defaultSettings,
                } as QueryItem,
            },
        });
        dispatch(setCurrentClusterToQuery());
        dispatch(setUserLastChoice());
        dispatch(resetQueryTabs());
    };
}

export function runQuery(
    afterCreate?: (query_id: string) => boolean | void,
    options?: {execution_mode: 'validate' | 'optimize'},
): ThunkAction<any, RootState, any, SetQueryAction | SetDirtySubmit> {
    return async (dispatch, getState) => {
        const state = getState();
        const query = getQueryDraft(state);

        const newQuery = {...query};
        if ('access_control_objects' in newQuery) {
            newQuery.access_control_objects = newQuery.access_control_objects?.filter(
                (i) => i !== SHARED_QUERY_ACO,
            );
        }

        dispatch({
            type: SET_DIRTY_SUBMIT,
            data: false,
        });

        const {query_id} = await wrapApiPromiseByToaster(dispatch(startQuery(newQuery, options)), {
            toasterName: 'start_query',
            skipSuccessToast: true,
            errorTitle: 'Failed to start query',
        });
        const handled = afterCreate?.(query_id);
        if (!handled) {
            dispatch(loadQuery(query_id));
        }

        dispatch(requestQueriesList(true));
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
            dispatch(requestQueriesList(true));
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
        dispatch({
            type: UPDATE_ACO_QUERY,
            data: {access_control_objects: aco},
        });
        dispatch(requestQueriesList(true));
    };
