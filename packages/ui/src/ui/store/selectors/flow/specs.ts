import {RootState} from '../../../store/reducers';

export const getFlowStaticSpecData = (state: RootState) => state.flow.staticSpec.data;
export const getFlowStaticSpecPath = (state: RootState) => state.flow.staticSpec.pipeline_path;
