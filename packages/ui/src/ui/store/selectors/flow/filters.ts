import {RootState} from '../../../store/reducers';

export const getFlowPipelinePath = (state: RootState) => state.flow.filters.pipelinePath;
export const getFlowComputationsNameFilter = (state: RootState) =>
    state.flow.filters.computationsNameFilter;
