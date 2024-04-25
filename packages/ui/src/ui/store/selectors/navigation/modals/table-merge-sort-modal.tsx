import {RootState} from '../../../reducers';
import {createSelector} from 'reselect';
import {PathAttribute} from '../../../reducers/navigation/modals/tableMergeSortModalSlice';
export const getNavigationTableSortPaths = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.paths;
export const getNavigationTableOutputPathAttributes = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.outputPathAttributes;
export const getNavigationTableAttributesValues = createSelector(
    [getNavigationTableOutputPathAttributes],
    (outputPathAttributes) => {
        const result: Record<string, string> = {};
        for (const key in outputPathAttributes) {
            if (Object.prototype.hasOwnProperty.call(outputPathAttributes, key)) {
                result[key] = outputPathAttributes[key as PathAttribute].value;
            }
        }
        return result;
    },
);
export const getNavigationTableSortError = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.error;
export const getNavigationTableSortVisible = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.sortVisible;
export const getNavigationTableMergeVisible = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.mergeVisible;
export const getNavigationTableSortSuggestColumns = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.suggestColumns;
