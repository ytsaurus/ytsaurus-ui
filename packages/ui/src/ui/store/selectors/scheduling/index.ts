import {RootState} from '../../../store/reducers';
import {calculateLoadingStatus, isFinalLoadingStatus} from '../../../utils/utils';
import {createSelector} from 'reselect';

export const getSchedulingIsFinalLoadingState = createSelector(
    [
        (store: RootState) => store.scheduling.scheduling.loading,
        (store: RootState) => store.scheduling.scheduling.loaded,
        (store: RootState) => store.scheduling.scheduling.error,
    ],
    (loading, loaded, error) => {
        const status = calculateLoadingStatus(loading, loaded, error);
        return isFinalLoadingStatus(status);
    },
);
