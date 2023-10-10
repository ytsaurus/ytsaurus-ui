import {createSelector} from 'reselect';

import {RootState} from '../../../store/reducers';

export const getSchedulingOperations = (state: RootState) =>
    state.scheduling.operations.rawOperations;
export const getSchedulingOperationsTree = (state: RootState) =>
    state.scheduling.operations.rawOperationsTree;
export const getSchedulingOperationsError = (state: RootState) => state.scheduling.operations.error;
export const getSchedulingOperationsLoading = (state: RootState) =>
    state.scheduling.operations.loading;
export const getSchedulingOperationsLoaded = (state: RootState) =>
    state.scheduling.operations.loading;
export const getSchedulingOperationsExpandedPools = (state: RootState) =>
    state.scheduling.operations.expandedPools;
export const getSchedulingOperationsLoadAll = (state: RootState) =>
    state.scheduling.operations.loadAllOperations;

export const getSchedulingOperationsLoadingStatus = createSelector(
    [getSchedulingOperationsLoading, getSchedulingOperationsLoaded],
    (loading, loaded) => {
        return loading && !loaded;
    },
);
