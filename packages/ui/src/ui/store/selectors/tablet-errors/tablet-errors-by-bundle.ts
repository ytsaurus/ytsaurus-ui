import {ROWS_PER_PAGE} from '../../../constants/pagination';
import {type RootState} from '../../../store/reducers';

export const selectTabletErrorsByBundleData = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.data;

export const selectTabletErrorsByBundleLoading = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.loading;

export const selectTabletErrorsByBundleLoaded = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.loaded;

export const selectTabletErrorsByBundleError = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.error;

export const selectTabletErrorsByBundleTimeRangeFilter = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.timeRangeFilter;

export const selectTabletErrorsByBundleMethodsFilter = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.methodsFilter;

export const selectTabletErrorsByBundlePageFilter = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.pageFilter;

export const selectTabletErrorsByBundleTablePathFilter = (state: RootState) =>
    state.tabletErrors.tabletErrorsByBundle.tablePathFilter;

export const selectTabletErrorsByBundlePageCount = (state: RootState) =>
    Math.max(
        Math.ceil((state.tabletErrors.tabletErrorsByBundle.total_row_count ?? 0) / ROWS_PER_PAGE),
        1,
    );
