import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {
    DefaultQueriesListFilter,
    QueriesListCursor,
    QueriesListFilter,
    QueriesListMode,
} from './types';
import type {QueryItem} from '../api';

export type State = 'loading' | 'ready' | 'error';

export type QueriesListState = {
    isLoading: boolean;
    items: QueryItem[];
    hasMore: boolean;
    timestamp: number; // Determines is the list is changed(by filter or cursor).
    filter: QueriesListFilter;
    cursor?: QueriesListCursor;
    listMode: QueriesListMode;
};

export const initialState: QueriesListState = {
    isLoading: false,
    items: [],
    hasMore: false,
    timestamp: 0,
    filter: DefaultQueriesListFilter[QueriesListMode.History],
    cursor: undefined,
    listMode: QueriesListMode.History,
};

const queryListSlice = createSlice({
    name: 'queryList',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setFilter: (state, action: PayloadAction<QueriesListFilter>) => {
            state.filter = action.payload;
        },
        setCursor: (state, action: PayloadAction<QueriesListCursor | undefined>) => {
            state.cursor = action.payload;
        },
        setListMode: (state, action: PayloadAction<QueriesListMode>) => {
            state.listMode = action.payload;
        },
        updateListState: (state, action: PayloadAction<Partial<QueriesListState>>) => {
            return {...state, ...action.payload};
        },
    },
});

export const {setLoading, setCursor, updateListState, setListMode, setFilter} =
    queryListSlice.actions;

export default queryListSlice.reducer;
