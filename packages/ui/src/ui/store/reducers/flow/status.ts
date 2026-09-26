import {type PayloadAction, createSlice} from '@reduxjs/toolkit';

import {type YTError} from '../../../../@types/types';

export type FlowStatusState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    pipeline_path: string | undefined;
    data: FlowStatus | undefined;

    requestedAction: FlowStateAction | undefined;
};

export type FlowStatus =
    'Unknown' | 'Stopped' | 'Paused' | 'Working' | 'Draining' | 'Pausing' | 'Completed';

export type FlowStateAction = 'start' | 'stop' | 'pause';

const ACTION_TARGET_STATES: Record<FlowStateAction, Array<FlowStatus>> = {
    start: ['Working', 'Completed'],
    stop: ['Stopped'],
    pause: ['Paused'],
};

const initialState: FlowStatusState = {
    loading: false,
    loaded: false,
    error: undefined,

    pipeline_path: undefined,
    data: undefined,

    requestedAction: undefined,
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
            if (pipeline_path !== state.pipeline_path) {
                Object.assign(state, {pipeline_path, data: undefined, requestedAction: undefined});
            }
        },
        onSuccess(state, {payload: {data}}: PayloadAction<Pick<FlowStatusState, 'data'>>) {
            Object.assign(state, {data, loading: false, loaded: true, error: undefined});
            const {requestedAction} = state;
            if (requestedAction && data && ACTION_TARGET_STATES[requestedAction].includes(data)) {
                state.requestedAction = undefined;
            }
        },
        onError(state, {payload: {error}}: PayloadAction<Pick<FlowStatusState, 'error'>>) {
            Object.assign(state, {error, loading: false});
        },
        setRequestedAction(
            state,
            {payload: {requestedAction}}: PayloadAction<Pick<FlowStatusState, 'requestedAction'>>,
        ) {
            state.requestedAction = requestedAction;
        },
    },
});

export const flowStatusActions = flowStatusSlice.actions;
export const status = flowStatusSlice.reducer;
