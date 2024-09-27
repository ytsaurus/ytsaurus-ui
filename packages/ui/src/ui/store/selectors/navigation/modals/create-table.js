import map_ from 'lodash/map';

import {createSelector} from 'reselect';

export const getCreateTableModalState = (state) => state.navigation.modals.createTable;
export const isCreateTableModalVisible = (state) => state.navigation.modals.createTable.showModal;
export const getCreateTableLockSuggestions = (state) =>
    state.navigation.modals.createTable.columnLockSuggestions;
export const getCreateTableGroupSuggestions = (state) =>
    state.navigation.modals.createTable.columnGroupSuggestions;

export const getColumnLockSuggestions = createSelector([getCreateTableLockSuggestions], (locks) => {
    const res = map_(locks, (item) => item);
    return res;
});

export const getColumnGroupSuggestions = createSelector(
    [getCreateTableGroupSuggestions],
    (groups) => {
        const res = map_(groups, (item) => item);
        return res;
    },
);
