import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {YTError} from '../../../../../types';

export interface ExportsState {
    config?: object;
    loading: boolean;
    loaded: boolean;
    error?: YTError;
}

const initialState: ExportsState = {
    loading: false,
    loaded: false,
};

const exportsSlice = createSlice({
    initialState,
    name: 'queueExports',
    reducers: {
        onGetConfigRequest(state: ExportsState) {
            return {...state, loading: true};
        },
        onGetConfigSuccess(
            state: ExportsState,
            {payload}: PayloadAction<Pick<ExportsState, 'config'>>,
        ) {
            return {...state, loaded: true, loading: false, ...payload};
        },
        onGetConfigFailure(
            state: ExportsState,
            {payload}: PayloadAction<Pick<ExportsState, 'error'>>,
        ) {
            return {...state, loading: false, ...payload};
        },
        onUpdateConfigRequest(state: ExportsState) {
            return {...state, loading: true};
        },
        onUpdateConfigSuccess(state: ExportsState) {
            return {...state, loaded: true, loading: false};
        },
        onUpdateConfigFailure(
            state: ExportsState,
            {payload}: PayloadAction<Pick<ExportsState, 'error'>>,
        ) {
            return {...state, loading: false, ...payload};
        },
    },
});

export const exportsActions = exportsSlice.actions;
export const exports = exportsSlice.reducer;
