import {type PayloadAction, createSlice} from '@reduxjs/toolkit';

import {type YTError} from '../../../../@types/types';
import {type FlowDynamicSpecPatch, type Int64} from '../../../../shared/yt-types';

export type FlowDynamicSpecView = 'effective' | 'base' | 'patches';

export type FlowSpecState = {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    pipeline_path: string | undefined;
    view?: FlowDynamicSpecView;
    supported_features?: string[];
    data: {spec: unknown; version: Int64; patches?: FlowDynamicSpecPatch[]} | undefined;
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
        {
            payload: {pipeline_path, view},
        }: PayloadAction<Pick<FlowSpecState, 'pipeline_path' | 'view'>>,
    ) {
        Object.assign(state, {loading: true, error: undefined});
        if (pipeline_path !== state.pipeline_path) {
            Object.assign(state, {
                pipeline_path,
                data: undefined,
                loaded: false,
                supported_features: undefined,
            });
        }
        if (view !== state.view) {
            Object.assign(state, {view, data: undefined});
        }
    },
    onSuccess(
        state: FlowSpecState,
        {
            payload: {data, supported_features},
        }: PayloadAction<Pick<FlowSpecState, 'data' | 'supported_features'>>,
    ) {
        Object.assign(state, {
            data,
            supported_features,
            loaded: true,
            loading: false,
            error: undefined,
        });
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
