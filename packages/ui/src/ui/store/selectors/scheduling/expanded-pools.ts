import {createSelector} from 'reselect';

import {type RootState} from '../../reducers';

export const selectExpandedPoolCypressData = (state: RootState) =>
    state.scheduling.expandedPools.flattenCypressData;

export const selectSchedulingOperations = (state: RootState) =>
    state.scheduling.expandedPools.rawOperations;
export const selectExpandedPoolsTree = (state: RootState) =>
    state.scheduling.expandedPools.expandedPoolsTree;
export const selectSchedulingOperationsError = (state: RootState) =>
    state.scheduling.expandedPools.error;
export const selectSchedulingOperationsLoading = (state: RootState) =>
    state.scheduling.expandedPools.loading;
export const selectSchedulingOperationsLoaded = (state: RootState) =>
    state.scheduling.expandedPools.loading;
export const selectSchedulingOperationsExpandedPools = (state: RootState) =>
    state.scheduling.expandedPools.expandedPools;
export const selectExpandedPoolsLoadAll = (state: RootState) =>
    state.scheduling.expandedPools.loadAll;

export const selectSchedulingOperationsLoadingStatus = createSelector(
    [selectSchedulingOperationsLoading, selectSchedulingOperationsLoaded],
    (loading, loaded) => {
        return loading && !loaded;
    },
);
