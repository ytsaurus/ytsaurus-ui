import {type RootState} from '../../reducers';
import {
    ACTION_TARGET_STATE,
    type FlowStateAction,
    isTargetStateReached,
} from '../../reducers/flow/status';

export const selectFlowStatusData = (state: RootState) => state.flow.status.data;
export const selectFlowStatusPipelinePath = (state: RootState) => state.flow.status.pipeline_path;
export const selectFlowStatusError = (state: RootState) => state.flow.status.error;

export const selectFlowRequestedAction = (state: RootState) => state.flow.status.requestedAction;

export const selectFlowActionInProgress = (state: RootState): FlowStateAction | undefined => {
    const {requestedAction, data, targetState} = state.flow.status;
    if (requestedAction) {
        return requestedAction;
    }
    if (!data || data === 'Unknown') {
        return undefined;
    }
    if (targetState) {
        // Covers transitions requested from another tab or from the CLI.
        const action = (Object.keys(ACTION_TARGET_STATE) as Array<FlowStateAction>).find(
            (key) => ACTION_TARGET_STATE[key] === targetState,
        );
        return action && !isTargetStateReached(targetState, data) ? action : undefined;
    }
    if (data === 'Draining') {
        return 'stop';
    }
    if (data === 'Pausing') {
        return 'pause';
    }
    return undefined;
};
