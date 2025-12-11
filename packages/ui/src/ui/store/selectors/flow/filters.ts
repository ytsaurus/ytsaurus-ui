import {RootState} from '../../../store/reducers';

export const getFlowViewMode = (state: RootState) => state.flow.filters.flowViewMode;

export const getPipelinePath = (state: RootState) => state.flow.filters.pipelinePath;
