import {RootState} from '../../../store/reducers';

export const getFlowGraphData = (state: RootState) => state.flow.graph.data;
