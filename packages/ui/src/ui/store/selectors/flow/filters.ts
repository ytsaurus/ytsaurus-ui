import {RootState} from '../../../store/reducers';

export const getFlowPipelinePath = (state: RootState) => state.flow.filters.pipelinePath;
export const getFlowComputationsNameFilter = (state: RootState) =>
    state.flow.filters.computationsNameFilter;

export const getFlowCurrentComputation = (state: RootState) =>
    state.flow.filters.currentComputation;

export const getFlowCurrentWorker = (state: RootState) => state.flow.filters.currentWorker;

export const getFlowCurrentPartition = (state: RootState) => state.flow.filters.currentPartition;

export const getFlowPartitionsJobStateFilter = (state: RootState) =>
    state.flow.filters.partitionsJobStateFilter;

export const getFlowPartitionsStateFilter = (state: RootState) =>
    state.flow.filters.partitionsStateFilter;
