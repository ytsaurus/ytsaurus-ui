import {ROWS_PER_PAGE} from '../../../../constants/pagination';
import {type RootState} from '../../../../store/reducers/index.main';

export const selectTabletErrorsByPathError = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.error;

export const selectTabletErrorsByPathLoading = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.loading;

export const selectTabletErrorsByPathLoaded = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.loaded;

export const selectTabletErrorsByPathData = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.data;

export const selectTabletErrorsByPathDataParams = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.dataParams;

export const selectTabletErrorsByPathAllMethods = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.data?.all_methods;

export const selectTabletErrorsByPathPageCount = (state: RootState) => {
    return Math.ceil(
        (state.navigation.tabs.tabletErrorsByPath.total_row_count ?? 0) / ROWS_PER_PAGE,
    );
};

export const selectTabletErrorCountLimitExceeded = (state: RootState) => {
    return state.navigation.tabs.tabletErrorsByPath?.error_count_limit_exceeded;
};

// Filters

export const selectTabletErrorsByPathTimeRange = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.timeRangeFilter;

export const selectTabletErrorsByPathMethodsFilter = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.methodsFilter;

export const selectTabletErrorsByPathPageFilter = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.pageFilter;

export const selectTabletErrorsByPathTabletIdFilter = (state: RootState) =>
    state.navigation.tabs.tabletErrorsByPath.tabletIdFilter;
