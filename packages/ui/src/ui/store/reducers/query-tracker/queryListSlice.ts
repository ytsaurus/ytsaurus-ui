import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import {
    DefaultQueriesListFilter,
    type QueriesListCursor,
    type QueriesListFilter,
    QueriesListMode,
} from '../../../types/query-tracker/queryList';
import {type QueryItem} from '../../../types/query-tracker/api';
import {QueriesHistoryCursorDirection} from './query-tracker-contants';

export type State = 'loading' | 'ready' | 'error';

export type QueriesListState = {
    isLoading: boolean;
    items: QueryItem[];
    hasMore: boolean;
    timestamp: number; // Determines is the list is changed(by filter or cursor).
    filter: QueriesListFilter;
    cursor: QueriesListCursor;
    listMode: QueriesListMode;
    searchMode: 'name' | 'text';
};

export const initialState: QueriesListState = {
    isLoading: false,
    items: [],
    hasMore: false,
    timestamp: 0,
    filter: DefaultQueriesListFilter[QueriesListMode.History],
    cursor: {
        direction: QueriesHistoryCursorDirection.PAST,
    },
    listMode: QueriesListMode.History,
    searchMode: 'name',
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
        setCursor: (state, action: PayloadAction<QueriesListCursor>) => {
            state.cursor = action.payload;
        },
        setListMode: (state, action: PayloadAction<QueriesListMode>) => {
            state.listMode = action.payload;
        },
        updateListState: (state, action: PayloadAction<Partial<QueriesListState>>) => {
            return {...state, ...action.payload};
        },
        setSearchMode: (state, action: PayloadAction<QueriesListState['searchMode']>) => {
            state.searchMode = action.payload;
        },
    },
});

export const {setLoading, setCursor, updateListState, setListMode, setFilter, setSearchMode} =
    queryListSlice.actions;

export default queryListSlice.reducer;
