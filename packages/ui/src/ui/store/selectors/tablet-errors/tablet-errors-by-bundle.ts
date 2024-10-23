import {RootState} from '../../../store/reducers';

export const getTabletErrorsByBundle = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.data;

export const getTabletErrorsByBundleLoading = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.loading;

export const getTabletErrorsByBundleLoaded = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.loaded;

export const getTabletErrorsByBundleError = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.error;

export const getTabletErrorsByBundleTimeRangeFilter = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.timeRangeFilter;

export const getTabletErrorsByBundleMethodsFilter = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.methodsFilter;

export const getTabletErrorsByBundlePageFilter = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.pageFilter;
