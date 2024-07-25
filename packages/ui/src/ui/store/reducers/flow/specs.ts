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

const reducers = {
    onRequest(
        state: FlowSpecState,
        {payload: {pipeline_path}}: PayloadAction<Pick<FlowSpecState, 'pipeline_path'>>,
    ) {
        Object.assign(state, {loading: true, error: undefined});
        if (pipeline_path !== state.pipeline_path) {
            Object.assign(state, {pipeline_path, data: undefined});
        }
    },
    onSuccess(state: FlowSpecState, {payload: {data}}: PayloadAction<Pick<FlowSpecState, 'data'>>) {
        Object.assign(state, {data, loaded: true, loading: false, error: undefined});
    },
    onError(state: FlowSpecState, {payload: {error}}: PayloadAction<Pick<FlowSpecState, 'error'>>) {
        Object.assign(state, {error, loading: false});
    },
};

export const staticSpecSlice = createSlice({
    name: 'flow.staticSpec',
    initialState,
    reducers,
});

export const staticSpecActions = staticSpecSlice.actions;
export const staticSpec = staticSpecSlice.reducer;

export const dynamicSpecSlice = createSlice({
    name: 'flow.dynamicSpec',
    initialState,
    reducers,
});

export const dynamicSpecActions = dynamicSpecSlice.actions;
export const dynamicSpec = dynamicSpecSlice.reducer;
