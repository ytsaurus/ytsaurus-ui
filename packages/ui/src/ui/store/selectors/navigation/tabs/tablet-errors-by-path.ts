import {ROWS_PER_PAGE} from '../../../../constants/pagination';
import {RootState} from '../../../../store/reducers/index.main';

export const getTabletErrorsByPathError = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.error;

export const getTabletErrorsByPathLoading = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.loading;

export const getTabletErrorsByPathLoaded = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.loaded;

export const getTabletErrorsByPathData = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.data;

export const getTabletErrorsByPathDataParams = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.dataParams;

export const getTabletErrorsByPathAllMethods = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.data?.all_methods;

export const getTabletErrorsByPathPageCount = (state: RootState) => {
    return Math.ceil(
        (state.navigation.tabs.tabletErrorsByPath.total_row_count ?? 0) / ROWS_PER_PAGE,
    );
};

export const getTabletErrorCountLimitExceeded = (state: RootState) => {
    return state.navigation.tabs.tabletErrorsByPath?.error_count_limit_exceeded;
};

// Filters

export const getTabletErrorsByPathTimeRange = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.timeRangeFilter;

export const getTabletErrorsByPathMethodsFilter = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.methodsFilter;

export const getTabletErrorsByPathPageFilter = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.pageFilter;

export const getTabletErrorsByPathTabletIdFilter = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.tabletIdFilter;
