import {type RootState} from '../../reducers';

export const selectFlowStatusData = (state: RootState) => state.flow.status.data;
export const selectFlowStatusPipelinePath = (state: RootState) => state.flow.status.pipeline_path;
export const selectFlowStatusError = (state: RootState) => state.flow.status.error;
