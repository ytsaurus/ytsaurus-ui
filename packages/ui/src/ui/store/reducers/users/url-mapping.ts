import {produce} from 'immer';
import {updateIfChanged} from '../../../utils/utils';
import {type RootState} from '..';

import {usersTableDefaultState} from './table';
import {parseSortState} from '../../../utils/index';

export const usersPageParams = {
    filter: {
        stateKey: 'users.table.nameFilter',
        initialState: usersTableDefaultState.nameFilter,
    },
    group: {
        stateKey: 'users.table.groupFilter',
        initialState: usersTableDefaultState.groupFilter,
    },
    banned: {
        stateKey: 'users.table.bannedFilter',
        initialState: usersTableDefaultState.bannedFilter,
    },
    sort: {
        stateKey: 'users.table.sort',
        initialState: usersTableDefaultState.sort,
        type: 'object',
        options: {
            parse: parseSortState,
        },
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
