import {createSelector} from 'reselect';

import {type RootState} from '../../../store/reducers';
import {type FlowStateViewerUrlState} from '../../reducers/flow/filters';

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

const selectFlowFilters = (state: RootState) => state.flow.filters;

export const selectFlowStateViewerUrlState = createSelector(
    [selectFlowFilters],
    ({
        stateViewerComputation,
        stateViewerPartition,
        stateViewerTarget,
        stateViewerName,
        stateViewerKeyText,
        stateViewerHeavyHitterSeed,
    }): FlowStateViewerUrlState => ({
        stateViewerComputation,
        stateViewerPartition,
        stateViewerTarget,
        stateViewerName,
        stateViewerKeyText,
        stateViewerHeavyHitterSeed,
    }),
);
