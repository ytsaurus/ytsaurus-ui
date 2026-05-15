import filter_ from 'lodash/filter';

import {createSelector} from 'reselect';
import {type RootState} from '../../../../store/reducers';
import {calculateLoadingStatus} from '../../../../utils/utils';

const selectLocks = (state: RootState) => state.navigation.tabs.locks.locks;
const selectLocksLoading = (state: RootState) => state.navigation.tabs.locks.loading;
const selectLocksLoaded = (state: RootState) => state.navigation.tabs.locks.loaded;
const selectLocksError = (state: RootState) => state.navigation.tabs.locks.error;
export const selectLocksModeFilter = (state: RootState) => state.navigation.tabs.locks.modeFilter;

export const selectLocksLoadStatus = createSelector(
    [selectLocksLoading, selectLocksLoaded, selectLocksError],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const selectLocksFiltered = createSelector(
    [selectLocksModeFilter, selectLocks],
    (modeFilter, items) => {
        if (!modeFilter) {
            return items;
        }
        return filter_(items, ({mode}) => mode === modeFilter);
    },
);
