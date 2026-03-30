import {RootState} from '../../../store/reducers';

export const selectFlowStaticSpecData = (state: RootState) => state.flow.staticSpec.data;
export const selectFlowStaticSpecPath = (state: RootState) => state.flow.staticSpec.pipeline_path;
export const selectFlowStaticSpecError = (state: RootState) => state.flow.staticSpec.error;
export const selectFlowStaticSpecFirstLoading = (state: RootState) => {
    const {loading, loaded} = state.flow.staticSpec;
    return !loaded && loading;
};

export const selectFlowDynamicSpecData = (state: RootState) => state.flow.dynamicSpec.data;
export const selectFlowDynamicSpecPath = (state: RootState) => state.flow.dynamicSpec.pipeline_path;
export const selectFlowDynamicSpecError = (state: RootState) => state.flow.dynamicSpec.error;
export const selectFlowDynamicSpecFirstLoading = (state: RootState) => {
    const {loading, loaded} = state.flow.dynamicSpec;
    return !loaded && loading;
};
