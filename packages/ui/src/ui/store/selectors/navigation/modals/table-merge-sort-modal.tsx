import {RootState} from '../../../../store/reducers';

export const getNavigationTableSortPaths = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.paths;
export const getNavigationTableSortError = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.error;
export const getNavigationTableSortVisible = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.sortVisible;
export const getNavigationTableMergeVisible = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.mergeVisible;
export const getNavigationTableSortSuggestColumns = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.suggestColumns;
