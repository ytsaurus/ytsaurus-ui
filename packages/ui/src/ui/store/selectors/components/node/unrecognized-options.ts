import {RootState} from '../../../reducers';

export const getNodeUnrecognizedOptionsData = (state: RootState) =>
    state.components.node.unrecognizedOptions.data;
export const getNodeUnrecognizedOptionsError = (state: RootState) =>
    state.components.node.unrecognizedOptions.error;
