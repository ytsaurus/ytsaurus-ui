import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {YTError} from '../../../../@types/types';
import {GetFlowViewData} from '../../../../shared/yt-types';

import {EMPTY_OBJECT} from '../../../constants/empty';

export type FlowLayoutState = {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    pipeline_path: string | undefined;
    data: GetFlowViewData | undefined;

    expandedComputations: Record<string, true>;
    expandedWorkers: Record<string, true>;
};

export const initialState: FlowLayoutState = {
    loaded: false,
    loading: false,
    error: undefined,

    pipeline_path: undefined,
    data: undefined,

    expandedComputations: EMPTY_OBJECT,
    expandedWorkers: EMPTY_OBJECT,
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
        onExpandComputation(
            state,
            {payload: {computation_id}}: PayloadAction<{computation_id: string}>,
        ) {
            if (state.expandedComputations[computation_id] === true) {
                delete state.expandedComputations[computation_id];
            } else {
                state.expandedComputations[computation_id] = true;
            }
        },
        onExpandWorker(
            state,
            {payload: {worker_address}}: PayloadAction<{worker_address: string}>,
        ) {
            if (state.expandedWorkers[worker_address] === true) {
                delete state.expandedWorkers[worker_address];
            } else {
                state.expandedWorkers[worker_address] = true;
            }
        },
    },
});

export const flowLayoutActions = layoutSlice.actions;
export const layout = layoutSlice.reducer;
