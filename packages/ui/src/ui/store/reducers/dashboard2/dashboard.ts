import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Config, ConfigItem} from '@gravity-ui/dashkit';

import {RootState} from '..';
import {defaultDashboardItems} from '../../../constants/dashboard2';
import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../../constants/utils';
import {mergeStateOnClusterChange} from '../utils';

export type ItemsTypes = keyof typeof defaultDashboardItems;

type DashboardSettings = {
    editMode: boolean;
    importDialogVisibility: boolean;
    edittingItem: Partial<ConfigItem> & {target: 'createItem' | 'editItem'; type: ItemsTypes};
    settingsDialogVisibility: boolean;
    edittingConfig: Config | undefined;
};

const initialState: DashboardSettings = {
    editMode: false,
    importDialogVisibility: false,
    edittingItem: {target: 'editItem', type: 'navigation'},
    settingsDialogVisibility: false,
    edittingConfig: undefined,
};

export const dashboard2Slice = createSlice({
    name: 'dashboard2',
    initialState,
    reducers: {
        toggleEditting: (state) => ({
            ...state,
            editMode: !state.editMode,
        }),
        toggleImportDialogVisibility: (state) => ({
            ...state,
            importDialogVisibility: !state.importDialogVisibility,
        }),
        openSettingsDialog: (
            state,
            {payload}: PayloadAction<Pick<DashboardSettings, 'edittingItem'>>,
        ) => ({
            ...state,
            settingsDialogVisibility: true,
            edittingItem: payload.edittingItem,
        }),
        closeSettingsDialog: (state) => ({...state, settingsDialogVisibility: false}),
        setEdittingConfig: (
            state,
            {payload}: PayloadAction<Pick<DashboardSettings, 'edittingConfig'>>,
        ) => ({...state, edittingConfig: payload.edittingConfig}),
    },
    extraReducers: (builder) => {
        builder.addCase(
            RESET_STORE_BEFORE_CLUSTER_CHANGE,
            mergeStateOnClusterChange(initialState, {}, (state) => state),
        );
    },
    selectors: {
        getEditMode: (state) => state.editMode,
        getEdittingItem: (state) => state.edittingItem,
        getImportDialogVisibility: (state) => state.importDialogVisibility,
        getSettingsDialogVisibility: (state) => state.settingsDialogVisibility,
        getEdittingConfig: (state) => state.edittingConfig,
    },
});

export const {
    toggleEditting,
    toggleImportDialogVisibility,
    openSettingsDialog,
    closeSettingsDialog,
    setEdittingConfig,
} = dashboard2Slice.actions;
export const {
    getEdittingItem,
    getEditMode,
    getImportDialogVisibility,
    getSettingsDialogVisibility,
    getEdittingConfig,
} = dashboard2Slice.getSelectors((state: RootState) => state.dashboard2.dashboard2);
export const dashboard2 = dashboard2Slice.reducer;
