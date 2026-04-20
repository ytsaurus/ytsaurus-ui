import {type RootState} from '../../../reducers';

export const selectNodeUnrecognizedOptionsData = (state: RootState) =>
    state.components.node.unrecognizedOptions.data;

export const selectNodeUnrecognizedOptionsError = (state: RootState) =>
    state.components.node.unrecognizedOptions.error;
