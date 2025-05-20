import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../../../../store/reducers';

type ConsumersState = {
    createDialogVisibility: boolean;
} & (
    | {
          unregisterDialogVisibility: true;
          consumerPath: string;
      }
    | {
          unregisterDialogVisibility: boolean;
          consumerPath?: string;
      }
);

const initialState: ConsumersState = {
    createDialogVisibility: false,
    unregisterDialogVisibility: false,
    consumerPath: undefined,
};

const consumersSlice = createSlice({
    name: 'consumers',
    initialState,
    reducers: {
        toggleCreateDialog: (state) => ({
            ...state,
            createDialogVisibility: !state.createDialogVisibility,
        }),
        openUnregisterDialog: (state, {payload}: PayloadAction<{consumerPath: string}>) => ({
            ...state,
            consumerPath: payload.consumerPath,
            unregisterDialogVisibility: true,
        }),
        closeUnregisterDialog: (state) => ({
            ...state,
            unregisterDialogVisibility: false,
        }),
    },
    selectors: {
        getCreateDialogVisibility: (state) => state.createDialogVisibility,
        getUnregisterDialogVisibility: (state) => state.unregisterDialogVisibility,
        getConsumerPath: (state) => state.consumerPath,
    },
});

export const consumers = consumersSlice.reducer;
export const {toggleCreateDialog, openUnregisterDialog, closeUnregisterDialog} =
    consumersSlice.actions;
export const {getCreateDialogVisibility, getUnregisterDialogVisibility, getConsumerPath} =
    consumersSlice.getSelectors((state: RootState) => state.navigation.tabs.queue.consumers);
