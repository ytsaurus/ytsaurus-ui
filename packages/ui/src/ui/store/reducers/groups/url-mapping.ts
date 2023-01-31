import produce from 'immer';
import _ from 'lodash';
import {RootState} from '../../../store/reducers';
import {updateIfChanged} from '../../../utils/utils';

import {groupsTableState} from './table';

export const groupsPageParams = {
    groupFilter: {
        stateKey: 'groups.table.nameFilter',
        initialState: groupsTableState.nameFilter,
    },
    sort: {
        stateKey: 'groups.table.sort',
        initialState: groupsTableState.sort,
        type: 'object',
    },
};

export function getGroupsPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(draft.groups.table, 'nameFilter', query.groups.table.nameFilter);
        updateIfChanged(draft.groups.table, 'sort', query.groups.table.sort);
    });
}
