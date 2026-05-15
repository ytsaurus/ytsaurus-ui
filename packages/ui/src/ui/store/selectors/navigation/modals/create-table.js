import map_ from 'lodash/map';

import {createSelector} from 'reselect';

export const selectCreateTableModalState = (state) => state.navigation.modals.createTable;
export const selectIsCreateTableModalVisible = (state) =>
    state.navigation.modals.createTable.showModal;
export const selectCreateTableLockSuggestions = (state) =>
    state.navigation.modals.createTable.columnLockSuggestions;
export const selectCreateTableGroupSuggestions = (state) =>
    state.navigation.modals.createTable.columnGroupSuggestions;

export const selectColumnLockSuggestions = createSelector(
    [selectCreateTableLockSuggestions],
    (locks) => {
        const res = map_(locks, (item) => item);
        return res;
    },
);

export const selectColumnGroupSuggestions = createSelector(
    [selectCreateTableGroupSuggestions],
    (groups) => {
        const res = map_(groups, (item) => item);
        return res;
    },
);
