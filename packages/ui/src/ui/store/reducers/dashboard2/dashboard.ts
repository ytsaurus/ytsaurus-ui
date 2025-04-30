import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ConfigItem} from '@gravity-ui/dashkit';

import {RootState} from '..';

type DashboardSettings = {
    editMode: boolean;
    importDialogVisibility: boolean;
    edittingItem?: ConfigItem;
};

const initialState: DashboardSettings = {
    editMode: false,
    importDialogVisibility: false,
    edittingItem: undefined,
};

export const dashboard2Slice = createSlice({
    name: 'dashboard2',
    initialState,
    reducers: {
        toggleEditing: (state) => ({
            ...state,
            editMode: !state.editMode,
        }),
        toggleImportDialogVisibility: (state) => ({
            ...state,
            importDialogVisibility: !state.importDialogVisibility,
        }),
        editItem: (state, {payload}: PayloadAction<Pick<DashboardSettings, 'edittingItem'>>) => ({
            ...state,
            edittingItem: payload?.edittingItem,
        }),
    },
    selectors: {
        getEditMode: (state) => state.editMode,
        getEdittingItem: (state) => state.edittingItem,
        getImportDialogVisibility: (state) => state.importDialogVisibility,
    },
});

export const {toggleEditing, toggleImportDialogVisibility, editItem} = dashboard2Slice.actions;
export const {getEdittingItem, getEditMode, getImportDialogVisibility} =
    dashboard2Slice.getSelectors((state: RootState) => state.dashboard2.dashboard2);
export const dashboard2 = dashboard2Slice.reducer;
