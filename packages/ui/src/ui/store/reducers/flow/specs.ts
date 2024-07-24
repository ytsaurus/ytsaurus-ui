import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {YTError} from '../../../../@types/types';

export type FlowSpecState = {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    pipeline_path: string | undefined;
    data: {spec: unknown; version: number} | undefined;
};

const initialState: FlowSpecState = {
    loaded: false,
    loading: false,
    error: undefined,

    pipeline_path: undefined,
    data: undefined,
};

export const staticSpecSlice = createSlice({
    name: 'flow.static-spec',
    initialState,
    reducers: {
        onRequest(
            state,
            {payload: {pipeline_path}}: PayloadAction<Pick<FlowSpecState, 'pipeline_path'>>,
        ) {
            Object.assign(state, {loading: true, error: undefined});
            if (pipeline_path !== state.pipeline_path) {
                Object.assign(state, {pipeline_path, data: undefined});
            }
        },
        onSuccess(state, {payload: {data}}: PayloadAction<Pick<FlowSpecState, 'data'>>) {
            Object.assign(state, {data, loaded: true, loading: true, error: undefined});
        },
        onError(state, {payload: {error}}: PayloadAction<Pick<FlowSpecState, 'error'>>) {
            Object.assign(state, {error, loading: false});
        },
    },
});

export const staticSpecActions = staticSpecSlice.actions;
export const staticSpec = staticSpecSlice.reducer;
