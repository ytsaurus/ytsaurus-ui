import {type PayloadAction, createSlice} from '@reduxjs/toolkit';

import {type YTError} from '../../../../@types/types';

export type FlowStatusState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    pipeline_path: string | undefined;
    data: FlowStatus | undefined;
    // The state the controller is moving the pipeline to, `target_state` of the dynamic spec.
    targetState: FlowStatus | undefined;

    // The action requested from this tab, until the pipeline reaches its state.
    requestedAction: FlowStateAction | undefined;
};

export type FlowStatus =
    'Unknown' | 'Stopped' | 'Paused' | 'Working' | 'Draining' | 'Pausing' | 'Completed';

export type FlowStateAction = 'start' | 'stop' | 'pause';

export const ACTION_TARGET_STATE: Record<FlowStateAction, FlowStatus> = {
    start: 'Completed',
    stop: 'Stopped',
    pause: 'Paused',
};

// Mirrors CheckTargetState of the controller: a completed pipeline never moves, a stopped one is
// never paused and a pipeline targeted to Completed is running while it is Working.
export function isTargetStateReached(targetState: FlowStatus, state: FlowStatus) {
    switch (targetState) {
        case 'Completed':
            return state === 'Working' || state === 'Completed';
        case 'Paused':
            return state === 'Paused' || state === 'Stopped' || state === 'Completed';
        default:
            return state === targetState || state === 'Completed';
    }
}

const initialState: FlowStatusState = {
    loading: false,
    loaded: false,
    error: undefined,

    pipeline_path: undefined,
    data: undefined,
    targetState: undefined,

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
                Object.assign(state, {
                    pipeline_path,
                    data: undefined,
                    targetState: undefined,
                    requestedAction: undefined,
                });
            }
        },
        onSuccess(
            state,
            {
                payload: {data, targetState},
            }: PayloadAction<Pick<FlowStatusState, 'data' | 'targetState'>>,
        ) {
            Object.assign(state, {
                data,
                targetState,
                loading: false,
                loaded: true,
                error: undefined,
            });
            const {requestedAction} = state;
            const isRequestedStateReached =
                requestedAction &&
                data &&
                isTargetStateReached(ACTION_TARGET_STATE[requestedAction], data);
            if (isRequestedStateReached) {
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
