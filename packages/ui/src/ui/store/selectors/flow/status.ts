import {type RootState} from '../../reducers';
import {type FlowStateAction} from '../../reducers/flow/status';

export const selectFlowStatusData = (state: RootState) => state.flow.status.data;
export const selectFlowStatusPipelinePath = (state: RootState) => state.flow.status.pipeline_path;
export const selectFlowStatusError = (state: RootState) => state.flow.status.error;

export const selectFlowRequestedAction = (state: RootState) => state.flow.status.requestedAction;

export const selectFlowActionInProgress = (state: RootState): FlowStateAction | undefined => {
    const {requestedAction, data} = state.flow.status;
    if (requestedAction) {
        return requestedAction;
    }
    if (data === 'Draining') {
        return 'stop';
    }
    if (data === 'Pausing') {
        return 'pause';
    }
    return undefined;
};
