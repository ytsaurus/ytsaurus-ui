import {nanoid} from '@reduxjs/toolkit';
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
    failNavigation,
    receiveNodes,
    receiveTable,
    setCluster,
    startNavigation,
} from '../../reducers/query-tracker/queryNavigationSlice';
import {
    selectClusterConfigs,
    selectFavouritePaths,
    selectNavigationCluster,
    selectNavigationClusterConfig,
    selectNavigationNodes,
    selectNavigationPath,
} from '../../selectors/query-tracker/queryNavigation';
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

const isCurrentRequest = (state: RootState, requestId: string) =>
    state.queryTracker.queryNavigation.requestId === requestId;

async function loadPathTargetNode(path: string, clusterConfig: ClusterConfig) {
    const results = await ytApiV3Id.executeBatch(YTApiId.navigationGetPath, {
        setup: {proxy: getClusterProxy(clusterConfig), JSONSerializer},
        parameters: {
            requests: [
                {command: 'get', parameters: {path: `${path}/@type`}},
                {command: 'get', parameters: {path: `${path}/@dynamic`}},
            ],
        },
    });
    return {type: results[0].output as string, dynamic: Boolean(results[1].output)};
}

export const loadNodeByPath =
    (rawPath: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const clusterConfig = selectNavigationClusterConfig(state);
        if (!clusterConfig) return;
        const path = rawPath || '/';
        const requestId = nanoid();
        const favorites = selectFavouritePaths(state);
        dispatch(startNavigation({requestId, path, nodeType: BodyType.Tree}));
        try {
            const nodes = await loadFolderByPath(
                path,
                {
                    proxy: getClusterProxy(clusterConfig),
                    JSONSerializer,
                },
                favorites,
            );
            dispatch(receiveNodes({requestId, nodes: nodes as NavigationNode[]}));
        } catch (error) {
            dispatch(failNavigation({requestId, error: error as YTError}));
        }
    };

export const loadTableAttributesByPath =
    (rawPath: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const clusterConfig = selectNavigationClusterConfig(state);
        if (!clusterConfig) return;
        const path = rawPath || '/';
        const requestId = nanoid();
        dispatch(startNavigation({requestId, path, nodeType: BodyType.Table}));
        const {cellSize, pageSize} = selectQueryResultGlobalSettings();
        const setup = {proxy: getClusterProxy(clusterConfig), JSONSerializer};
        const nodeFromList = selectNavigationNodes(state).find((node) => node.path === path);
        try {
            const [table, targetNode] = await Promise.all([
                loadTableAttributesByPathFromComponents(path, setup, {
                    clusterId: clusterConfig.id,
                    login: selectCurrentUserName(state),
                    limit: pageSize,
                    cellSize,
                    defaultTableColumnLimit: selectDefaultTableColumnLimit(state),
                    useYqlTypes: selectIsYqlTypesEnabled(state),
                    showDecoded: selectYsonSettingsDisableDecode(state).showDecoded,
                    navigationTableConfig: ytComponentsNavigationMetaConfig,
                }),
                nodeFromList?.type
                    ? Promise.resolve({type: nodeFromList.type, dynamic: nodeFromList.dynamic})
                    : loadPathTargetNode(path, clusterConfig).catch(() => undefined),
            ]);
            dispatch(receiveTable({requestId, table, targetNode}));
        } catch (error) {
            dispatch(failNavigation({requestId, error: error as YTError}));
        }
    };

export const loadPath =
    (rawPath: string, clusterConfig: ClusterConfig): AsyncAction =>
    async (dispatch, getState) => {
        const path = rawPath || '/';
        const requestId = nanoid();
        dispatch(setCluster(clusterConfig.id));
        dispatch(startNavigation({requestId, path, nodeType: BodyType.Loading}));
        try {
            const type = await ytApiV3Id.get(YTApiId.navigationGetType, {
                setup: {proxy: getClusterProxy(clusterConfig), JSONSerializer},
                parameters: {path: `${path}/@type`},
            });
            if (!isCurrentRequest(getState(), requestId)) return;
            if (isTableNode(type)) {
                await dispatch(loadTableAttributesByPath(path));
            } else if (isFolderNode(type)) {
                await dispatch(loadNodeByPath(path));
            } else {
                throw new Error("Can't open this type of node");
            }
        } catch (error) {
            dispatch(failNavigation({requestId, error: error as YTError}));
        }
    };

export const setNavigationCluster =
    (clusterId: string): AsyncAction =>
    async (dispatch) => {
        dispatch(setCluster(clusterId));
        await dispatch(loadNodeByPath('/'));
    };

export const initNavigation = (): AsyncAction => (dispatch, getState) => {
    const state = getState();
    const clusterConfig = selectNavigationClusterConfig(state);
    if (clusterConfig) dispatch(loadPath(selectNavigationPath(state), clusterConfig));
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

        dispatch(setSettingByKey('global::queryTracker::queriesListSidebarVisibilityMode', true));
        dispatch(setListMode(QueriesListMode.Navigation));
        dispatch(loadPath(cleanPath, clusterConfig));
    };
