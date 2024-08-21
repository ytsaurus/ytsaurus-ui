import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import {Action} from 'redux';
import {
    BodyType,
    NavigationNode,
    NavigationTable,
    NavigationTableSchema,
    setCluster,
    setFilter,
    setNodeType,
    setNodes,
    setPath,
    setTable,
} from './queryNavigationSlice';
import {
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

export const loadNodeByPath =
    (path: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const clusterConfig = selectNavigationClusterConfig(state);
        const favorites = selectFavouritePaths(state);

        if (!clusterConfig) return;

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
        );

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

export const setNavigationCluster =
    (clusterId: string): AsyncAction =>
    (dispatch) => {
        dispatch(setCluster(clusterId));
        dispatch(setPath('/'));
        dispatch(loadNodeByPath('/'));
    };

export const initNavigation = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const clusterConfig = selectNavigationClusterConfig(state);
    const path = selectNavigationPath(state);

    if (!clusterConfig) return;

    const r = await wrapApiPromiseByToaster(
        ytApiV3Id.get(YTApiId.navigationGetType, {
            setup: {
                proxy: getClusterProxy(clusterConfig),
                ...JSONParser,
            },
            parameters: {
                path: `${path}/@type`,
            },
        }),
        {
            skipSuccessToast: true,
            toasterName: 'query_navigation_get_node_type',
            errorTitle: 'Navigation get node type failure',
        },
    );

    if (isTableNode(r)) {
        await dispatch(loadTableAttributesByPath(path));
        return;
    }
    if (isFolderNode(r)) {
        await dispatch(loadNodeByPath(path));
        return;
    }

    dispatch(loadNodeByPath('/'));
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
