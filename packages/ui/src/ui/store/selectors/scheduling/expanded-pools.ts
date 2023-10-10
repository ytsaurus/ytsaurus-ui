import {createSelector} from 'reselect';

import {RootState} from '../../reducers';

export const getSchedulingOperations = (state: RootState) =>
    state.scheduling.expandedPools.rawOperations;
export const getSchedulingOperationsTree = (state: RootState) =>
    state.scheduling.expandedPools.rawOperationsTree;
export const getSchedulingOperationsError = (state: RootState) =>
    state.scheduling.expandedPools.error;
export const getSchedulingOperationsLoading = (state: RootState) =>
    state.scheduling.expandedPools.loading;
export const getSchedulingOperationsLoaded = (state: RootState) =>
    state.scheduling.expandedPools.loading;
export const getSchedulingOperationsExpandedPools = (state: RootState) =>
    state.scheduling.expandedPools.expandedPools;
export const getExpandedPoolsLoadAll = (state: RootState) => state.scheduling.expandedPools.loadAll;

export const getSchedulingOperationsLoadingStatus = createSelector(
    [getSchedulingOperationsLoading, getSchedulingOperationsLoaded],
    (loading, loaded) => {
        return loading && !loaded;
    },
);
