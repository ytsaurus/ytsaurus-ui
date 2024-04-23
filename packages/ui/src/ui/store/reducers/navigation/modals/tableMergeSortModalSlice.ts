import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {YTError} from '../../../../../@types/types';
import {Reducer} from 'redux';

type TableSortMergeActionData =
    | Pick<TableSortMergeModal, 'sortVisible' | 'paths'>
    | Pick<TableSortMergeModal, 'mergeVisible' | 'paths'>
    | Pick<TableSortMergeModal, 'error'>
    | Pick<TableSortMergeModal, 'suggestColumns'>;

export type TableSortMergeModal = {
    sortVisible: boolean;
    mergeVisible: boolean;
    paths: Array<string>;
    suggestColumns: Array<string>;
    error?: YTError;
};

const initialState: TableSortMergeModal = {
    sortVisible: false,
    mergeVisible: false,
    paths: [],
    suggestColumns: [],
};

const tableMergeSortModalSlice = createSlice({
    name: 'tableMergeSortModal',
    initialState,
    reducers: {
        setModalPartial(state, {payload}: PayloadAction<TableSortMergeActionData>) {
            return {...state, ...payload};
        },
    },
});

export const {setModalPartial} = tableMergeSortModalSlice.actions;

export default tableMergeSortModalSlice.reducer as Reducer<TableSortMergeModal>;
