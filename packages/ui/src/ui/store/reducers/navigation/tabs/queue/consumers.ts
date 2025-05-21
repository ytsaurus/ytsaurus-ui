import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../../../../store/reducers';

type ConsumersState = {
    createDialogVisibility: boolean;
    registerDialogVisibility: boolean;
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
    registerDialogVisibility: false,
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
        toggleRegisterDialog: (state) => ({
            ...state,
            registerDialogVisibility: !state.registerDialogVisibility,
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
        getRegisterDialogVisibility: (state) => state.registerDialogVisibility,
        getUnregisterDialogVisibility: (state) => state.unregisterDialogVisibility,
        getConsumerPath: (state) => state.consumerPath,
    },
});

export const consumers = consumersSlice.reducer;
export const {
    toggleCreateDialog,
    toggleRegisterDialog,
    openUnregisterDialog,
    closeUnregisterDialog,
} = consumersSlice.actions;
export const {
    getCreateDialogVisibility,
    getRegisterDialogVisibility,
    getUnregisterDialogVisibility,
    getConsumerPath,
} = consumersSlice.getSelectors((state: RootState) => state.navigation.tabs.queue.consumers);
