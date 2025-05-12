import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ConfigItem} from '@gravity-ui/dashkit';

import {RootState} from '..';
import {defaultDashboardItems} from '../../../constants/dashboard2';

export type ItemsTypes = keyof typeof defaultDashboardItems;

type DashboardSettings = {
    editMode: boolean;
    importDialogVisibility: boolean;
    edittingConfig: Partial<ConfigItem> & {target: 'createItem' | 'editItem'; type: ItemsTypes};
    settingsDialogVisibility: boolean;
};

const initialState: DashboardSettings = {
    editMode: false,
    importDialogVisibility: false,
    edittingConfig: {target: 'editItem', type: 'navigation'},
    settingsDialogVisibility: false,
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
        openSettingsDialog: (
            state,
            {payload}: PayloadAction<Pick<DashboardSettings, 'edittingConfig'>>,
        ) => ({
            ...state,
            settingsDialogVisibility: true,
            edittingConfig: payload.edittingConfig,
        }),
        closeSettingsDialog: (state) => ({...state, settingsDialogVisibility: false}),
    },
    selectors: {
        getEditMode: (state) => state.editMode,
        getEdittingItem: (state) => state.edittingConfig,
        getImportDialogVisibility: (state) => state.importDialogVisibility,
        getSettingsDialogVisibility: (state) => state.settingsDialogVisibility,
    },
});

export const {
    toggleEditing,
    toggleImportDialogVisibility,
    openSettingsDialog,
    closeSettingsDialog,
} = dashboard2Slice.actions;
export const {
    getEdittingItem,
    getEditMode,
    getImportDialogVisibility,
    getSettingsDialogVisibility,
} = dashboard2Slice.getSelectors((state: RootState) => state.dashboard2.dashboard2);
export const dashboard2 = dashboard2Slice.reducer;
