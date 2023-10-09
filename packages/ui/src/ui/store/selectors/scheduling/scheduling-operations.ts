import {createSelector} from 'reselect';

import {RootState} from '../../../store/reducers';

export const getSchedulingOperations = (state: RootState) =>
    state.schedulingOperations.rawOperations;
export const getSchedulingOperationsTree = (state: RootState) =>
    state.schedulingOperations.rawOperationsTree;
export const getSchedulingOperationsError = (state: RootState) => state.schedulingOperations.error;
export const getSchedulingOperationsLoading = (state: RootState) =>
    state.schedulingOperations.loading;
export const getSchedulingOperationsLoaded = (state: RootState) =>
    state.schedulingOperations.loading;
export const getSchedulingOperationsExpandedPools = (state: RootState) =>
    state.schedulingOperations.expandedPools;
export const getSchedulingOperationsLoadAll = (state: RootState) =>
    state.schedulingOperations.loadAllOperations;

export const getSchedulingOperationsLoadingStatus = createSelector(
    [getSchedulingOperationsLoading, getSchedulingOperationsLoaded],
    (loading, loaded) => {
        return loading && !loaded;
    },
);
