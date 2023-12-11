import {RootState} from '../../reducers';

export const getChytSpecletLoaded = (state: RootState) => state.chyt.speclet.loaded;
export const getChytSpecletData = (state: RootState) => state.chyt.speclet.data;
export const getChytSpecletDataAlias = (state: RootState) => state.chyt.speclet.dataAlias;
export const getChytSpecletError = (state: RootState) => state.chyt.speclet.error;
