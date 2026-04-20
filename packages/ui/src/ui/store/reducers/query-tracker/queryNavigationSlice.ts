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
    nodes: NavigationNode[];
    table?: NavigationTable;
    error?: YTError;
};

export const initialState: RepoNavigationState = {
    loading: false,
    nodeType: BodyType.Cluster,
    path: '/',
    cluster: undefined,
    filter: '',
    nodes: [],
    table: undefined,
    error: undefined,
};

const queryNavigationSlice = createSlice({
    name: 'queryNavigation',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setCluster(state, {payload}: PayloadAction<string | undefined>) {
            state.cluster = payload;
        },
        setPath(state, {payload}: PayloadAction<string>) {
            state.path = payload;
        },
        setNodeType(state, {payload}: PayloadAction<BodyType>) {
            state.nodeType = payload;
        },
        setFilter(state, {payload}: PayloadAction<string>) {
            state.filter = payload;
        },
        setNodes(state, {payload}: PayloadAction<any>) {
            state.nodes = payload;
        },
        setTable(state, {payload}: PayloadAction<NavigationTable>) {
            state.table = payload;
        },
        setError(state, {payload}: PayloadAction<RepoNavigationState['error']>) {
            state.error = payload;
        },
    },
});

export const {
    setLoading,
    setFilter,
    setCluster,
    setPath,
    setNodeType,
    setNodes,
    setTable,
    setError,
} = queryNavigationSlice.actions;

export const queryNavigationReducer = queryNavigationSlice.reducer;
