import {RootState} from '../../reducers';

export const selectChytSpecletLoaded = (state: RootState) => state.chyt.speclet.loaded;
export const selectChytSpecletData = (state: RootState) => state.chyt.speclet.data;
export const selectChytSpecletDataAlias = (state: RootState) => state.chyt.speclet.dataAlias;
export const selectChytSpecletError = (state: RootState) => state.chyt.speclet.error;
