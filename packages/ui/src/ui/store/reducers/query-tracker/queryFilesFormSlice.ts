import {SET_QUERY_FILES} from './query-tracker-contants';
import type {ActionD} from '../../../types';

import {type Reducer} from 'redux';
import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import {type QueryFile, type QueryFileType} from '../../../types/query-tracker/api';
import {mergeStateOnClusterChange} from '../utils';

export type SetQueryFilesAction = ActionD<
    typeof SET_QUERY_FILES,
    {files: QueryFile[]; deletedFiles: QueryFile[]}
>;

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
    extraReducers: (builder) => {
        builder.addCase(SET_QUERY_FILES, (state, action: SetQueryFilesAction) => {
            state.deletedFiles = action.data.deletedFiles;
        });
    },
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
