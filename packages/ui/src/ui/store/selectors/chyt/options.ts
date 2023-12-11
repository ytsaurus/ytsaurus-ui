import {RootState} from '../../reducers';

export const getChytOptionsData = (state: RootState) => state.chyt.options.data;
export const getChytOptionsDataAlias = (state: RootState) => state.chyt.options.dataAlias;
export const getChytOptionsError = (state: RootState) => state.chyt.options.error;
