import {RootState} from '../../../store/reducers';

export const getChytCliqueData = (state: RootState) => state.chyt.clique.data;
export const getChytCliqueError = (state: RootState) => state.chyt.clique.error;

export const getChytCliqueInitialLoading = (state: RootState) => {
    const {loaded, loading} = state.chyt.clique;
    return !loaded && loading;
};
