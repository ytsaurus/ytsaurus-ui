import {RootState} from '../../reducers';

export const selectChytOptionsData = (state: RootState) => state.chyt.options.data;
export const selectChytOptionsDataAlias = (state: RootState) => state.chyt.options.dataAlias;
export const getChytOptionsError = (state: RootState) => state.chyt.options.error;
