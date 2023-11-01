import {RootState} from '../../reducers';

export const getChytSpecletInitialLoading = (state: RootState) => {
    const {loaded, loading} = state.chyt.speclet;
    return !loaded && loading;
};

export const getChytSpecletData = (state: RootState) => state.chyt.speclet.data;
export const getChytSpecletDataAlias = (state: RootState) => state.chyt.speclet.dataAlias;
export const getChytSpecletError = (state: RootState) => state.chyt.speclet.error;
