import {Reducer} from 'redux';
import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import type {QueryFile, QueryFileType} from '../api';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';

export type QueryFileAddForm = {
    isOpen: boolean;
    type?: QueryFileType;
};

export type QueryFileEditor = {
    isOpen: boolean;
    isFullWidth: boolean;
    fileId: string | null;
    fileType: 'file' | 'deletedFile';
};

export type QueryFilesState = {
    deletedFiles: QueryFile[];
    addForm: QueryFileAddForm;
    fileEditor: QueryFileEditor;
};

const initialState: QueryFilesState = {
    deletedFiles: [],
    addForm: {
        isOpen: false,
    },
    fileEditor: {
        isOpen: false,
        isFullWidth: false,
        fileId: null,
        fileType: 'file',
    },
};

const queryFilesFormSlice = createSlice({
    name: 'queryFilesModal',
    initialState,
    reducers: {
        setDeletedFiles(state, {payload}: PayloadAction<QueryFile[]>) {
            state.deletedFiles = payload;
        },
        setAddForm(state, {payload}: PayloadAction<QueryFileAddForm>) {
            state.addForm = payload;
        },
        setFileEditor(state, {payload}: PayloadAction<QueryFileEditor>) {
            state.fileEditor = payload;
        },
    },
});

export const {setDeletedFiles, setAddForm, setFileEditor} = queryFilesFormSlice.actions;
export const queryFilesFormReducer = mergeStateOnClusterChange(
    initialState,
    {},
    queryFilesFormSlice.reducer as Reducer<QueryFilesState>,
);
