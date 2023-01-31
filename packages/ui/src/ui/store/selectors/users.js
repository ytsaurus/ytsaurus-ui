import {filter, sortedIndexOf} from 'lodash';
import {createSelector} from 'reselect';
import {sortArrayBySortState} from '../../utils/sort-helpers';
import {concatByAnd} from '../../common/hammer/predicate';

// Table

export const getUsersTableDataState = (state) => state.users.table;

export const getUsers = (state) => state.users.table.users;
export const getUsersNameFilter = (state) => state.users.table.nameFilter;
export const getUsersGroupFilter = (state) => state.users.table.groupFilter;
export const getUsersBannedFilter = (state) => state.users.table.bannedFilter;
export const getUsersSort = (state) => state.users.table.sort;

export const getUsersFiltered = createSelector(
    [getUsers, getUsersNameFilter, getUsersGroupFilter, getUsersBannedFilter],
    (users, nameFilter, groupFilter, bannedFilter) => {
        const predicates = [
            nameFilter && (({name}) => name.indexOf(nameFilter) !== -1),
            groupFilter &&
                (({member_of: memberOf, transitiveGroups}) => {
                    return (
                        -1 !== sortedIndexOf(memberOf, groupFilter) ||
                        -1 !== sortedIndexOf(transitiveGroups, groupFilter)
                    );
                }),
            bannedFilter && (({banned}) => banned),
        ].filter(Boolean);

        if (predicates.length === 0) {
            return users;
        }

        return filter(users, concatByAnd(...predicates));
    },
);

export const getUsersFilteredAndSorted = createSelector(
    [getUsersSort, getUsersFiltered],
    (sortState, users) => {
        return sortArrayBySortState(users, sortState);
    },
);

// User editor
export const getUsersPageEditableUser = (state) => state.users.editUser;
