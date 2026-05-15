import {type RootState} from '../../../reducers';
import {createSelector} from 'reselect';
import {type PathAttribute} from '../../../reducers/navigation/modals/tableMergeSortModalSlice';
export const selectNavigationTableSortPaths = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.paths;
export const selectNavigationTableOutputPathAttributes = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.outputPathAttributes;
export const selectNavigationTableAttributesValues = createSelector(
    [selectNavigationTableOutputPathAttributes],
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
export const selectNavigationTableSortError = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.error;
export const selectNavigationTableSortVisible = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.sortVisible;
export const selectNavigationTableMergeVisible = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.mergeVisible;
export const selectNavigationTableSortSuggestColumns = (state: RootState) =>
    state.navigation.modals.tableMergeSortModal.suggestColumns;
