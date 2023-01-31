import produce from 'immer';
import _ from 'lodash';
import {updateIfChanged} from '../../../utils/utils';
import {RootState} from '..';

import {usersTableState} from './table';

export const usersPageParams = {
    filter: {
        stateKey: 'users.table.nameFilter',
        initialState: usersTableState.nameFilter,
    },
    group: {
        stateKey: 'users.table.groupFilter',
        initialState: usersTableState.groupFilter,
    },
    banned: {
        stateKey: 'users.table.bannedFilter',
        initialState: usersTableState.bannedFilter,
    },
    sort: {
        stateKey: 'users.table.sort',
        initialState: usersTableState.sort,
        type: 'object',
    },
};

export function getUsersPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(draft.users.table, 'nameFilter', query.users.table.nameFilter);
        updateIfChanged(draft.users.table, 'groupFilter', query.users.table.groupFilter);
        updateIfChanged(draft.users.table, 'bannedFilter', query.users.table.bannedFilter);
        updateIfChanged(draft.users.table, 'sort', query.users.table.sort);
    });
}
