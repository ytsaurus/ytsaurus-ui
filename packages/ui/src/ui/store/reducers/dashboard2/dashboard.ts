import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ConfigItem} from '@gravity-ui/dashkit';

import {RootState} from '..';

type DashboardSettings = {
    editMode: boolean;
    edittingItem?: ConfigItem;
};

const initialState: DashboardSettings = {
    editMode: false,
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
        editItem: (state, {payload}: PayloadAction<Pick<DashboardSettings, 'edittingItem'>>) => ({
            ...state,
            edittingItem: payload?.edittingItem,
        }),
    },
    selectors: {
        selectEditMode: (state) => state.editMode,
        selectEdittingItem: (state) => state.edittingItem,
    },
});

export const {toggleEditing, editItem} = dashboard2Slice.actions;
export const {selectEdittingItem, selectEditMode} = dashboard2Slice.getSelectors(
    (state: RootState) => state.dashboard2.dashboard2,
);
export const dashboard2 = dashboard2Slice.reducer;
