import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ReactNode} from 'react';

export const enum BodyType {
    Tree = 'tree',
    Table = 'table',
    Cluster = 'cluster',
}

export type NavigationNode = {
    name: string;
    type?: string;
    broken?: boolean;
    dynamic?: boolean;
    path: string;
    isFavorite: boolean;
};

export type NavigationTableSchema = {
    name: string;
    required: boolean;
    sort_order?: string;
    type: string;
};

export type NavigationTableMeta = {
    key: string;
    value: ReactNode;
    visible?: boolean;
};

export type NavigationTable = {
    name: string;
    rows: any[];
    columns: string[];
    schema: NavigationTableSchema[];
    meta: NavigationTableMeta[][];
    yqlTypes: unknown[] | null;
};

export type RepoNavigationState = {
    nodeType: BodyType;
    path: string;
    cluster: string | undefined;
    filter: string;
    nodes: NavigationNode[];
    table: null | NavigationTable;
};

export const initialState: RepoNavigationState = {
    nodeType: BodyType.Cluster,
    path: '/',
    cluster: undefined,
    filter: '',
    nodes: [],
    table: null,
};

const queryNavigationSlice = createSlice({
    name: 'queryNavigation',
    initialState,
    reducers: {
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
    },
});

export const {setFilter, setCluster, setPath, setNodeType, setNodes, setTable} =
    queryNavigationSlice.actions;

export const queryNavigationReducer = queryNavigationSlice.reducer;
