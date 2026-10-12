import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import {
    type NavigationNode,
    type NavigationTable,
    type NavigationTableMeta,
    type NavigationTableSchema,
} from '@ytsaurus/components';
import {type YTError} from '../../../../@types/types';

export type {NavigationNode, NavigationTable, NavigationTableMeta, NavigationTableSchema};

export const enum BodyType {
    Tree = 'tree',
    Table = 'table',
    Cluster = 'cluster',
    Loading = 'loading',
    Error = 'error',
}

export type RepoNavigationState = {
    loading: boolean;
    nodeType: BodyType;
    path: string;
    cluster: string | undefined;
    filter: string;
    filterContext?: {cluster: string | undefined; path: string};
    schemaFilter: string;
    schemaContext?: {cluster: string | undefined; path: string};
    requestId?: string;
    nodes: NavigationNode[];
    pathTargetNode?: Pick<NavigationNode, 'type' | 'dynamic'>;
    table?: NavigationTable;
    error?: YTError;
};

export const initialState: RepoNavigationState = {
    loading: false,
    nodeType: BodyType.Cluster,
    path: '/',
    cluster: undefined,
    filter: '',
    schemaFilter: '',
    nodes: [],
    table: undefined,
    error: undefined,
};

const queryNavigationSlice = createSlice({
    name: 'queryNavigation',
    initialState,
    reducers: {
        startNavigation(
            state,
            {
                payload,
            }: PayloadAction<{
                requestId: string;
                path: string;
                nodeType: BodyType;
            }>,
        ) {
            state.requestId = payload.requestId;
            state.path = payload.path;
            state.nodeType = payload.nodeType;
            state.error = undefined;
            state.table = undefined;
            state.pathTargetNode = undefined;
            state.loading = true;
            if (payload.nodeType === BodyType.Table) {
                if (
                    state.schemaContext?.cluster !== state.cluster ||
                    state.schemaContext?.path !== payload.path
                ) {
                    state.schemaFilter = '';
                }
                state.schemaContext = {cluster: state.cluster, path: payload.path};
            }
            if (payload.nodeType === BodyType.Tree) {
                state.nodes = [];
                if (
                    state.filterContext?.cluster !== state.cluster ||
                    state.filterContext?.path !== payload.path
                ) {
                    state.filter = '';
                }
                state.filterContext = {cluster: state.cluster, path: payload.path};
            }
        },
        receiveNodes(
            state,
            {payload}: PayloadAction<{requestId: string; nodes: NavigationNode[]}>,
        ) {
            if (state.requestId !== payload.requestId) return;
            state.nodes = payload.nodes;
            state.loading = false;
        },
        receiveTable(
            state,
            {
                payload,
            }: PayloadAction<{
                requestId: string;
                table: NavigationTable;
                targetNode?: Pick<NavigationNode, 'type' | 'dynamic'>;
            }>,
        ) {
            if (state.requestId !== payload.requestId) return;
            state.table = payload.table;
            state.pathTargetNode = payload.targetNode;
            state.loading = false;
        },
        failNavigation(state, {payload}: PayloadAction<{requestId: string; error: YTError}>) {
            if (state.requestId !== payload.requestId) return;
            state.loading = false;
            state.error = payload.error;
            state.nodeType = BodyType.Error;
        },
        setCluster(state, {payload}: PayloadAction<string | undefined>) {
            if (payload === state.cluster) return;
            state.requestId = undefined;
            state.loading = false;
            state.table = undefined;
            state.pathTargetNode = undefined;
            state.error = undefined;
            state.filter = '';
            state.filterContext = undefined;
            state.schemaFilter = '';
            state.schemaContext = undefined;
            state.nodes = [];
            state.cluster = payload;
        },
        setPath(state, {payload}: PayloadAction<string>) {
            state.path = payload;
        },
        setNodeType(state, {payload}: PayloadAction<BodyType>) {
            state.nodeType = payload;
            state.requestId = undefined;
        },
        setFilter(state, {payload}: PayloadAction<string>) {
            state.filter = payload;
            state.filterContext = {cluster: state.cluster, path: state.path};
        },
        setSchemaFilter(state, {payload}: PayloadAction<string>) {
            state.schemaFilter = payload;
        },
    },
});

export const {
    startNavigation,
    receiveNodes,
    receiveTable,
    failNavigation,
    setFilter,
    setSchemaFilter,
    setCluster,
    setPath,
    setNodeType,
} = queryNavigationSlice.actions;

export const queryNavigationReducer = queryNavigationSlice.reducer;
