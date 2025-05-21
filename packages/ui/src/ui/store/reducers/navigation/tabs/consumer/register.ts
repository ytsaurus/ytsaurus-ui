import {createSlice} from '@reduxjs/toolkit';

import {RootState} from '../../../../../store/reducers';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';

const initialState = {
    registerDialogVisibility: false,
};

const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        toggleRegisterDialog: (state) => ({
            ...state,
            registerDialogVisibility: !state.registerDialogVisibility,
        }),
    },
    selectors: {
        getRegisterDialogVisibility: (state) => state.registerDialogVisibility,
    },
});

export const {toggleRegisterDialog} = registerSlice.actions;
export const {getRegisterDialogVisibility} = registerSlice.getSelectors(
    (state: RootState) => state.navigation.tabs.consumer.register,
);
export default mergeStateOnClusterChange(initialState, {}, registerSlice.reducer);
