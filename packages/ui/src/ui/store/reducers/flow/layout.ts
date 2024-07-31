import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {YTError} from '../../../../@types/types';
import {GetFlowViewData} from '../../../../shared/yt-types';

export type FlowLayoutState = {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    pipeline_path: string | undefined;
    data: GetFlowViewData | undefined;
};

export const initialState: FlowLayoutState = {
    loaded: false,
    loading: false,
    error: undefined,

    pipeline_path: undefined,
    data: undefined,
};

export const layoutSlice = createSlice({
    name: 'flow.layout',
    initialState,
    reducers: {
        onRequest(
            state,
            {payload: {pipeline_path}}: PayloadAction<Pick<FlowLayoutState, 'pipeline_path'>>,
        ) {
            Object.assign(state, {loading: true, error: undefined});
            if (pipeline_path !== state.pipeline_path) {
                Object.assign(state, {pipeline_path, state: undefined});
            }
        },
        onSuccess(state, {payload: {data}}: PayloadAction<Pick<FlowLayoutState, 'data'>>) {
            Object.assign(state, {data, loaded: true, loading: false, error: undefined});
        },
        onError(state, {payload: {error}}: PayloadAction<Pick<FlowLayoutState, 'error'>>) {
            Object.assign(state, {error});
        },
    },
});

export const flowLayoutActions = layoutSlice.actions;
export const layout = layoutSlice.reducer;
