import _ from 'lodash';
import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {calculateLoadingStatus} from '../../../../utils/utils';

const getLocks = (state: RootState) => state.navigation.tabs.locks.locks;
const getLocksLoading = (state: RootState) => state.navigation.tabs.locks.loading;
const getLocksLoaded = (state: RootState) => state.navigation.tabs.locks.loaded;
const getLocksError = (state: RootState) => state.navigation.tabs.locks.error;
export const getLocksModeFilter = (state: RootState) => state.navigation.tabs.locks.modeFilter;

export const getLocksLoadStatus = createSelector(
    [getLocksLoading, getLocksLoaded, getLocksError],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const getLocksFiltered = createSelector(
    [getLocksModeFilter, getLocks],
    (modeFilter, items) => {
        if (!modeFilter) {
            return items;
        }
        return _.filter(items, ({mode}) => mode === modeFilter);
    },
);
