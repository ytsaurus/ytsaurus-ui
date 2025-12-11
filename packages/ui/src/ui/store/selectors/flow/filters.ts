import {RootState} from '../../../store/reducers';

export const getPipelinePath = (state: RootState) => state.flow.filters.pipelinePath;
