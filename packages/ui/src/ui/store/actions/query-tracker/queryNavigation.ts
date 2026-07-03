import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../reducers';
import {type Action} from 'redux';
import {
    loadFolderByPath,
    loadTableAttributesByPath as loadTableAttributesByPathFromComponents,
} from '@ytsaurus/components';
import {
    BodyType,
    type NavigationNode,
    type NavigationTable,
    setCluster,
    setError,
    setFilter,
    setLoading,
    setNodeType,
    setNodes,
    setPath,
    setPathTargetNode,
    setTable,
} from '../../reducers/query-tracker/queryNavigationSlice';
import {
    selectClusterConfigs,
    selectFavouritePaths,
    selectNavigationCluster,
    selectNavigationClusterConfig,
    selectNavigationNodes,
    selectNavigationPath,
} from '../../selectors/query-tracker/queryNavigation';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {JSONSerializer} from '../../../common/yt-api';
import {isTableNode} from '../../../utils/navigation/isTableNode';
import {isFolderNode} from '../../../utils/navigation/isFolderNode';
import {QueryEngine} from '../../../../shared/constants/engines';
import {loadCliqueByCluster, loadTablePromptToQuery} from './query';
import {selectQueryDraft} from '../../selectors/query-tracker/query';
import {selectDefaultTableColumnLimit} from '../../selectors/settings';
import {selectIsYqlTypesEnabled} from '../../selectors/navigation/content/table';
import {getClusterProxy, selectCurrentUserName} from '../../selectors/global';
import {selectQueryResultGlobalSettings} from '../../selectors/query-tracker/queryResult';
import {selectYsonSettingsDisableDecode} from '../../selectors/thor/unipika';
import {QueriesListMode} from '../../../types/query-tracker/queryList';
import {type ClusterConfig} from '../../../../shared/yt-types';
import {type YTError} from '../../../../@types/types';
import {setSettingByKey} from '../settings';
import {setListMode} from '../../reducers/query-tracker/queryListSlice';
import {toaster} from '../../../utils/toaster';
import {ytComponentsNavigationMetaConfig} from '../../../components/MetaTable/ytComponentsNavigationMetaConfig';

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

const loadPathTargetNode =
    (path: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const clusterConfig = selectNavigationClusterConfig(state);
        const nodeList = selectNavigationNodes(state);

        const nodeFromList = nodeList.find((node) => node.path === path);
        if (nodeFromList?.type) {
            dispatch(
                setPathTargetNode({
                    type: nodeFromList.type,
                    dynamic: nodeFromList.dynamic,
                }),
            );
            return;
        }

        if (!clusterConfig) return;

        try {
            const setup = {
                proxy: getClusterProxy(clusterConfig),
                JSONSerializer,
            };

            const results = await ytApiV3Id.executeBatch(YTApiId.navigationGetPath, {
                parameters: {
                    requests: [
                        {
                            command: 'get',
                            parameters: {
                                path: `${path}/@type`,
                            },
                        },
                        {
                            command: 'get',
                            parameters: {
                                path: `${path}/@dynamic`,
                            },
                        },
                    ],
                },
                setup,
            });

            dispatch(
                setPathTargetNode({
                    type: results[0].output as string,
                    dynamic: Boolean(results[1].output),
                }),
            );
        } catch {
            dispatch(setPathTargetNode(undefined));
        }
    };

// nodes list by path
export const loadNodeByPath =
    (path: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const clusterConfig = selectNavigationClusterConfig(state);
        const favorites = selectFavouritePaths(state);

        if (!clusterConfig) return;

        const setup = {
            proxy: getClusterProxy(clusterConfig),
            JSONSerializer,
        };

        dispatch(setLoading(true));
        const nodes = await wrapApiPromiseByToaster(loadFolderByPath(path, setup, favorites), {
            skipSuccessToast: true,
            toasterName: 'query_navigation_node',
            errorTitle: 'Navigation node open failure',
        }).finally(() => {
            dispatch(setLoading(false));
        });

        if (!nodes) return;

        dispatch(setFilter(''));
        dispatch(setPath(path));
        dispatch(setNodeType(BodyType.Tree));
        dispatch(setPathTargetNode(undefined));
        dispatch(setNodes(nodes as NavigationNode[]));
    };

// load table by path
export const loadTableAttributesByPath =
    (path: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const clusterConfig = selectNavigationClusterConfig(state);
        const {cellSize, pageSize} = selectQueryResultGlobalSettings();
        const defaultTableColumnLimit = selectDefaultTableColumnLimit(state);
        const useYqlTypes = selectIsYqlTypesEnabled(state);
        const login = selectCurrentUserName(state);
        const ysonSettings = selectYsonSettingsDisableDecode(state);

        if (!clusterConfig) return;

        const setup = {
            proxy: getClusterProxy(clusterConfig),
            JSONSerializer,
        };

        try {
            await dispatch(loadPathTargetNode(path));
            const tableData = await loadTableAttributesByPathFromComponents(path, setup, {
                clusterId: clusterConfig.id,
                login,
                limit: pageSize,
                cellSize,
                defaultTableColumnLimit,
                useYqlTypes,
                showDecoded: ysonSettings.showDecoded,
                navigationTableConfig: ytComponentsNavigationMetaConfig,
            });

            dispatch(setPath(path));
            dispatch(setTable(tableData as NavigationTable));
            dispatch(setNodeType(BodyType.Table));
        } catch (e) {
            toaster.add({
                theme: 'danger',
                autoHiding: false,
                name: 'Load table data error',
                title: e ? (e as Error).message : "Can't load table data",
            });
        }
    };

export const loadPath =
    (path: string, clusterConfig: ClusterConfig): AsyncAction =>
    async (dispatch) => {
        try {
            dispatch(setCluster(clusterConfig.id));
            dispatch(setPath(path));

            const type = await ytApiV3Id.get(YTApiId.navigationGetType, {
                setup: {
                    proxy: getClusterProxy(clusterConfig),
                    JSONSerializer,
                },
                parameters: {
                    path: `${path}/@type`,
                },
            });

            if (isTableNode(type)) {
                await dispatch(loadTableAttributesByPath(path));
            } else if (isFolderNode(type)) {
                await dispatch(loadNodeByPath(path));
            } else {
                throw new Error("Сan't open this type of node");
            }
        } catch (e) {
            dispatch(setError(e as YTError));
            dispatch(setNodeType(BodyType.Error));
        }
    };

export const setNavigationCluster =
    (clusterId: string): AsyncAction =>
    async (dispatch) => {
        dispatch(setCluster(clusterId));
        dispatch(setPath('/'));
        await dispatch(loadNodeByPath('/'));
    };

export const initNavigation = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const clusterConfig = selectNavigationClusterConfig(state);
    const path = selectNavigationPath(state);

    if (!clusterConfig) return;

    if (path) {
        dispatch(setNodeType(BodyType.Loading));
    }

    dispatch(loadPath(path, clusterConfig));
};

export const copyPathToClipboard =
    (path: string): AsyncAction =>
    async (_, getState) => {
        const state = getState();
        const cluster = selectNavigationCluster(state);

        if (!cluster) return;

        try {
            await navigator.clipboard.writeText(path);
            toaster.add({
                theme: 'success',
                name: 'copy_navigation_path',
                title: 'Path copied',
            });
        } catch (e) {
            toaster.add({
                theme: 'danger',
                name: 'copy_navigation_path',
                title: "Can't copy path",
                content: (e as Error).message,
                autoHiding: false,
            });
        }
    };

export const makeNewQueryWithTableSelect =
    (path: string, engine: QueryEngine): AsyncAction =>
    async (dispatch, getState) => {
        const clusterConfig = selectNavigationClusterConfig(getState());

        if (!clusterConfig) return;

        if (engine === QueryEngine.CHYT) {
            dispatch(loadCliqueByCluster(engine, clusterConfig.id));
        }

        dispatch(loadTablePromptToQuery(clusterConfig.id, path, engine));
    };

// open path in navigation tab on monaco path click
export const openPath =
    (path: string, clusterId: string | null): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const {settings} = selectQueryDraft(state);
        const clusters = selectClusterConfigs(state);
        const currentClusterId = clusterId || settings?.cluster;
        if (!currentClusterId) return;

        const clusterConfig = clusters[currentClusterId];
        if (!clusterConfig) return;

        const cleanPath = path.replace(/\/+$/, '');

        await dispatch(
            setSettingByKey('global::queryTracker::queriesListSidebarVisibilityMode', true),
        );
        dispatch(setListMode(QueriesListMode.Navigation));
        dispatch(setNodeType(BodyType.Loading));
        dispatch(loadPath(cleanPath, clusterConfig));
    };
