import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {YTError} from '../../../../@types/types';
import {FlowExecuteData} from '../../../../shared/yt-types';

import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../../constants/utils';
import {mergeStateOnClusterChange} from '../utils';

export type FlowGraphState = {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    pipeline_path: string | undefined;
    data: FlowExecuteData['describe-pipeline'] | undefined;
};

export const initialState: FlowGraphState = {
    loaded: false,
    loading: false,
    error: undefined,

    pipeline_path: undefined,
    data: undefined,
};

export const flowGraphSlice = createSlice({
    name: 'flow.graph',
    initialState,
    reducers: {
        onRequest(
            state,
            {payload: {pipeline_path}}: PayloadAction<Pick<FlowGraphState, 'pipeline_path'>>,
        ) {
            Object.assign(state, {loading: true, error: undefined});
            if (pipeline_path !== state.pipeline_path) {
                Object.assign(state, {pipeline_path, state: undefined});
            }
        },
        onSuccess(state, {payload: {data}}: PayloadAction<Pick<FlowGraphState, 'data'>>) {
            Object.assign(state, {data, loaded: true, loading: false, error: undefined});
        },
        onError(state, {payload: {error}}: PayloadAction<Pick<FlowGraphState, 'error'>>) {
            Object.assign(state, {error});
        },
    },
    extraReducers: (builder) => {
        builder.addCase(
            RESET_STORE_BEFORE_CLUSTER_CHANGE,
            mergeStateOnClusterChange({}, initialState, (state) => state),
        );
    },
});
