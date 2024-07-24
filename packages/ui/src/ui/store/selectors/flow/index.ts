import {RootState} from '../../../store/reducers';

export const getFlowViewMode = (state: RootState) => state.flow.filters.flowViewMode;
