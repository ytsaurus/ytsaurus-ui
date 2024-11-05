import {ROWS_PER_PAGE} from '../../../constants/pagination';
import {RootState} from '../../../store/reducers';

export const getTabletErrorsByBundleData = (state: RootState) =>
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

export const getTabletErrorsByBundleTablePathFilter = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.tablePathFilter;

export const getTabletErrorsByBundlePageCount = (state: RootState) =>
    Math.max(
        Math.ceil((state.tabletErrors.tabletErrorsByBundle.total_row_count ?? 0) / ROWS_PER_PAGE),
        1,
    );
