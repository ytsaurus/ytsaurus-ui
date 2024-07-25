import {RootState} from '../../reducers';

export const getFlowStatusData = (state: RootState) => state.flow.status.data;
export const getFlowStatusPipelinePath = (state: RootState) => state.flow.status.pipeline_path;
export const getFlowStatusError = (state: RootState) => state.flow.status.error;
