import {RootState} from '../../../store/reducers';

export const getFlowStaticSpecData = (state: RootState) => state.flow.staticSpec.data;
export const getFlowStaticSpecPath = (state: RootState) => state.flow.staticSpec.pipeline_path;
export const getFlowStaticSpecError = (state: RootState) => state.flow.staticSpec.error;
export const getFlowStaticSpecFirstLoading = (state: RootState) => {
    const {loading, loaded} = state.flow.staticSpec;
    return !loaded && loading;
};

export const getFlowDynamicSpecData = (state: RootState) => state.flow.dynamicSpec.data;
export const getFlowDynamicSpecPath = (state: RootState) => state.flow.dynamicSpec.pipeline_path;
export const getFlowDynamicSpecError = (state: RootState) => state.flow.dynamicSpec.error;
export const getFlowDynamicSpecFirstLoading = (state: RootState) => {
    const {loading, loaded} = state.flow.dynamicSpec;
    return !loaded && loading;
};
