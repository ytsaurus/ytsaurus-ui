import {type RootState} from '../../store/reducers';
import filter_ from 'lodash/filter';
import sortedIndexOf_ from 'lodash/sortedIndexOf';

import {createSelector} from 'reselect';
import {type SortState} from '../../types';
import {sortArrayBySortState} from '../../utils/sort-helpers';
import {concatByAnd} from '../../common/hammer/predicate';
import {type UsersTableUser} from '../reducers/users/table';

// Table

export const selectUsersTableDataState = (state: RootState) => state.users.table;

export const selectUsers = (state: RootState) => state.users.table.users;
export const selectUsersNameFilter = (state: RootState) => state.users.table.nameFilter;
export const selectUsersGroupFilter = (state: RootState) => state.users.table.groupFilter;
export const selectUsersBannedFilter = (state: RootState) => state.users.table.bannedFilter;
export const selectUsersSort = (state: RootState) => state.users.table.sort;

export const selectUsersFiltered = createSelector(
    [selectUsers, selectUsersNameFilter, selectUsersGroupFilter, selectUsersBannedFilter],
    (users, nameFilter, groupFilter, bannedFilter) => {
        const predicates: Array<(u: UsersTableUser) => boolean> = [];
        if (nameFilter) {
            predicates.push(({name}) => name.indexOf(nameFilter) !== -1);
        }
        if (groupFilter) {
            predicates.push(({member_of: memberOf, transitiveGroups}) => {
                return (
                    -1 !== sortedIndexOf_(memberOf, groupFilter) ||
                    -1 !== sortedIndexOf_(transitiveGroups, groupFilter)
                );
            });
        }
        if (bannedFilter) {
            predicates.push(({banned}) => banned);
        }

        if (predicates.length === 0) {
            return users;
        }

        return filter_(users, concatByAnd(...predicates));
    },
);

export const selectUsersFilteredAndSorted = createSelector(
    [selectUsersSort, selectUsersFiltered],
    (sortState, users) => {
        return sortArrayBySortState(users, sortState as SortState<keyof UsersTableUser>);
    },
);

// User editor
export const selectUsersPageEditableUser = (state: RootState) => state.users.editUser;
