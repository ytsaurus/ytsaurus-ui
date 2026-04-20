import {type RootState} from '../../../store/reducers';

export const selectFlowPipelinePath = (state: RootState) => state.flow.filters.pipelinePath;
export const selectFlowComputationsNameFilter = (state: RootState) =>
    state.flow.filters.computationsNameFilter;

export const selectFlowCurrentComputation = (state: RootState) =>
    state.flow.filters.currentComputation;

export const selectFlowCurrentWorker = (state: RootState) => state.flow.filters.currentWorker;

export const selectFlowCurrentPartition = (state: RootState) => state.flow.filters.currentPartition;

export const selectFlowPartitionsJobStateFilter = (state: RootState) =>
    state.flow.filters.partitionsJobStateFilter;

export const selectFlowPartitionsStateFilter = (state: RootState) =>
    state.flow.filters.partitionsStateFilter;

export const selectFlowZoomToNode = (state: RootState) => state.flow.filters.zoomToNode;
