import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Config, ConfigItem} from '@gravity-ui/dashkit';

import {RootState} from '..';
import {defaultDashboardItems} from '../../../constants/dashboard2';
import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../../constants/utils';
import {mergeStateOnClusterChange} from '../utils';

export type ItemsTypes = keyof typeof defaultDashboardItems;

type DashboardSettings = {
    editMode: boolean;
    copyConfigDialogVisibility: boolean;
    edittingItem?: Partial<ConfigItem> & {target: 'createItem' | 'editItem'; type: ItemsTypes};
    settingsDialogVisibility: boolean;
    edittingConfig: Config | undefined;
};

const initialState: DashboardSettings = {
    editMode: false,
    copyConfigDialogVisibility: false,
    edittingItem: undefined,
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
        toggleCopyConfigDialogVisibility: (state) => ({
            ...state,
            copyConfigDialogVisibility: !state.copyConfigDialogVisibility,
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
        getCopyConfigDialogVisibility: (state) => state.copyConfigDialogVisibility,
        getSettingsDialogVisibility: (state) => state.settingsDialogVisibility,
        getEdittingConfig: (state) => state.edittingConfig,
    },
});

export const {
    toggleEditting,
    toggleCopyConfigDialogVisibility,
    openSettingsDialog,
    closeSettingsDialog,
    setEdittingConfig,
} = dashboard2Slice.actions;
export const {
    getEdittingItem,
    getEditMode,
    getCopyConfigDialogVisibility,
    getSettingsDialogVisibility,
    getEdittingConfig,
} = dashboard2Slice.getSelectors((state: RootState) => state.dashboard2.dashboard2);
export const dashboard2 = dashboard2Slice.reducer;
