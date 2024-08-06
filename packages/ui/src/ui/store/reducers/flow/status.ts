import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {YTError} from '../../../../@types/types';

export type FlowStatusState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    pipeline_path: string | undefined;
    data: FlowStatus | undefined;
};

export type FlowStatus =
    | 'Unknown'
    | 'Stopped'
    | 'Paused'
    | 'Working'
    | 'Draining'
    | 'Pausing'
    | 'Completed';

const initialState: FlowStatusState = {
    loading: false,
    loaded: false,
    error: undefined,

    pipeline_path: undefined,
    data: undefined,
};

const flowStatusSlice = createSlice({
    name: 'flow.status',
    initialState,
    reducers: {
        onRequest(
            state,
            {payload: {pipeline_path}}: PayloadAction<Pick<FlowStatusState, 'pipeline_path'>>,
        ) {
            state.loading = true;
            if (pipeline_path != state.pipeline_path) {
                Object.assign(state, {pipeline_path, data: undefined});
            }
        },
        onSuccess(state, {payload: {data}}: PayloadAction<Pick<FlowStatusState, 'data'>>) {
            Object.assign(state, {data, loading: false, loaded: true, error: undefined});
        },
        onError(state, {payload: {error}}: PayloadAction<Pick<FlowStatusState, 'error'>>) {
            Object.assign(state, {error, loading: false});
        },
    },
});

export const flowStatusActions = flowStatusSlice.actions;
export const status = flowStatusSlice.reducer;
