import {type RootState} from '../../../store/reducers';

export const selectChytCliqueData = (state: RootState) => state.chyt.clique.data;
export const selectChytCliqueError = (state: RootState) => state.chyt.clique.error;

export const selectChytCliqueInitialLoading = (state: RootState) => {
    const {loaded, loading} = state.chyt.clique;
    return !loaded && loading;
};

export const selectChytCliqueStartError = (state: RootState) => state.chyt.clique.data?.error;
