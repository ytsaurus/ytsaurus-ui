import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import {Action} from 'redux';
import {
    BodyType,
    NavigationNode,
    NavigationTable,
    NavigationTableSchema,
    setCluster,
    setError,
    setFilter,
    setLoading,
    setNodeType,
    setNodes,
    setPath,
    setTable,
} from './queryNavigationSlice';
import {
    selectClusterConfigs,
    selectFavouritePaths,
    selectNavigationCluster,
    selectNavigationClusterConfig,
    selectNavigationNodes,
    selectNavigationPath,
} from './selectors';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import ypath from '../../../../common/thor/ypath';
import {makeMetaItems} from '../../../../components/MetaTable/presets/presets';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {getTableTypeByAttributes} from '../../../../utils/navigation/getTableTypeByAttributes';
import {Toaster} from '@gravity-ui/uikit';
import {loadDynamicTableRequest} from '../../Navigation/api/loadDynamicTable';
import {loadStaticTable} from '../../Navigation/api/loadStaticTable';
import {JSONParser} from '../api';
import {toggleFavourite} from '../../../../store/actions/favourites';
import {createNestedNS} from '../../../../../shared/utils/settings';
import {NAMESPACES} from '../../../../../shared/constants/settings';
import {isTableNode} from '../../Navigation/helpers/isTableNode';
import {isFolderNode} from '../../Navigation/helpers/isFolderNode';
import {loadTableAttributes} from '../../Navigation/api/loadTableAttributes';
import {QueryEngine} from '../engines';
import {createEmptyQuery, loadCliqueByCluster, updateQueryDraft} from '../query/actions';
import {createTableSelect} from '../../Navigation/helpers/createTableSelect';
import {insertTextWhereCursor} from '../../Navigation/helpers/insertTextWhereCursor';
import {editor as monacoEditor} from 'monaco-editor';
import {getQueryDraft} from '../query/selectors';
import {getRequestOutputFormat} from '../../../../utils/navigation/content/table/table';
import {getDefaultTableColumnLimit} from '../../../../store/selectors/settings';
import {isYqlTypesEnabled} from '../../../../store/selectors/navigation/content/table';
import {getClusterProxy, getCurrentUserName} from '../../../../store/selectors/global';
import {getQueryResultGlobalSettings} from '../query_result/selectors';
import {SET_QUERIES_LIST_MODE} from '../query-tracker-contants';
import {QueriesListMode} from '../queries_list/types';
import type {ClusterConfig} from '../../../../../shared/yt-types';
import {YTError} from '../../../../../@types/types';
import {setSettingByKey} from '../../../../store/actions/settings';

const toaster = new Toaster();

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

export const toggleFavoritePath =
    (favoritePath: string): AsyncAction =>
    (dispatch, getState) => {
        const state = getState();
        const cluster = selectNavigationCluster(state);
        const nodes = selectNavigationNodes(state);

        if (!cluster) return;
        const parentNS = createNestedNS(cluster, NAMESPACES.LOCAL);
        dispatch(toggleFavourite(favoritePath, parentNS));

        const newNodes = nodes.map((node) => {
            if (node.path === favoritePath) {
                return {
                    ...node,
                    isFavorite: !node.isFavorite,
                };
            }
            return node;
        });
        dispatch(setNodes(newNodes));
    };

// nodes list by path
export const loadNodeByPath =
    (path: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const clusterConfig = selectNavigationClusterConfig(state);
        const favorites = selectFavouritePaths(state);

        if (!clusterConfig) return;

        dispatch(setLoading(true));
        const response = await wrapApiPromiseByToaster(
            ytApiV3Id.list(YTApiId.navigationListNodes, {
                setup: {
                    proxy: getClusterProxy(clusterConfig),
                    ...JSONParser,
                },
                parameters: {
                    path,
                    attributes: ['type', 'broken', 'dynamic'],
                },
            }),
            {
                skipSuccessToast: true,
                toasterName: 'query_navigation_node',
                errorTitle: 'Navigation node open failure',
            },
        ).finally(() => {
            dispatch(setLoading(false));
        });

        const nodes: NavigationNode[] = response
            .map((item: unknown) => {
                const name = ypath.getValue(item);
                const newPath = path + '/' + name;
                const attributes = ypath.getAttributes(item);

                return {
                    name,
                    ...attributes,
                    path: newPath,
                    isFavorite: favorites.includes(newPath),
                };
            })
            .sort((a: NavigationNode, b: NavigationNode) => a.name.localeCompare(b.name));

        dispatch(setFilter(''));
        dispatch(setPath(path));
        dispatch(setNodeType(BodyType.Tree));
        dispatch(setNodes(nodes));
    };

// load table by path
export const loadTableAttributesByPath =
    (path: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const clusterConfig = selectNavigationClusterConfig(state);
        const {cellSize, pageSize} = getQueryResultGlobalSettings();
        const defaultTableColumnLimit = getDefaultTableColumnLimit(state);
        const useYqlTypes = isYqlTypesEnabled(state);
        const login = getCurrentUserName(state);

        if (!clusterConfig) return;

        const attributes = await loadTableAttributes(path, clusterConfig);
        const schema: NavigationTableSchema[] = ypath.getValue(attributes.schema);
        const output_format = getRequestOutputFormat(
            schema.map((i) => i.name),
            cellSize,
            login,
            defaultTableColumnLimit,
            useYqlTypes,
        );

        const requestFunction = attributes.dynamic ? loadDynamicTableRequest : loadStaticTable;

        try {
            const {columns, rows, yqlTypes} = await requestFunction({
                login: state.global.login,
                path,
                clusterConfig,
                schema,
                keyColumns: attributes.key_columns,
                limit: pageSize,
                output_format,
            });

            const tableData: NavigationTable = {
                name: attributes.key,
                meta: makeMetaItems({
                    cluster: clusterConfig.id,
                    attributes: attributes,
                    tableType: getTableTypeByAttributes(attributes.dynamic, attributes),
                    isDynamic: attributes.dynamic,
                }),
                rows,
                schema,
                columns,
                yqlTypes,
            };

            dispatch(setPath(path));
            dispatch(setTable(tableData));
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
                    ...JSONParser,
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
    (path: string, engine: QueryEngine, editor: monacoEditor.IStandaloneCodeEditor): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const {pageSize} = getQueryResultGlobalSettings();
        const clusterConfig = selectNavigationClusterConfig(state);
        const {settings} = getQueryDraft(state);

        if (!clusterConfig) return;
        await dispatch(createEmptyQuery());

        const newSettings: Record<string, string> = settings ? {...settings} : {};
        newSettings.cluster = clusterConfig.id;
        if (engine === QueryEngine.CHYT) {
            dispatch(loadCliqueByCluster(engine, clusterConfig.id));
        }
        dispatch(updateQueryDraft({engine, settings: newSettings}));

        const text = await createTableSelect({clusterConfig, path, engine, limit: pageSize});
        insertTextWhereCursor(text, editor);
    };

// open path in navigation tab on monaco path click
export const openPath =
    (path: string, clusterId: string | null): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const {settings} = getQueryDraft(state);
        const clusters = selectClusterConfigs(state);
        const currentClusterId = clusterId || settings?.cluster;
        if (!currentClusterId) return;

        const clusterConfig = clusters[currentClusterId];
        if (!clusterConfig) return;

        const cleanPath = path.replace(/\/+$/, '');

        await dispatch(
            setSettingByKey('global::queryTracker::queriesListSidebarVisibilityMode', true),
        );
        dispatch({
            type: SET_QUERIES_LIST_MODE,
            data: {
                listMode: QueriesListMode.Navigation,
            },
        });
        dispatch(setNodeType(BodyType.Loading));
        dispatch(loadPath(cleanPath, clusterConfig));
    };
