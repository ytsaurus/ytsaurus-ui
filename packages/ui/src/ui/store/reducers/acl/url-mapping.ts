import {produce} from 'immer';
import {RootState} from '..';
import {initialState} from './acl-filters';
import {updateIfChanged} from '../../../utils/utils';
import {LocationParameters} from '../../../store/location';
import {parseSerializeArrayString} from '../../../utils/parse-serialize';

export const aclFiltersParams: LocationParameters = {
    approversSubject: {
        stateKey: 'aclFilters.approversSubject',
        initialState: initialState.approversSubject,
    },
    objectSubject: {
        stateKey: 'aclFilters.objectSubject',
        initialState: initialState.objectSubject,
    },
    oPermissionsFilter: {
        stateKey: 'aclFilters.objectPermissions',
        initialState: initialState.objectPermissions,
        type: 'array',
    },
    cColumns: {
        stateKey: 'aclFilters.columnsFilter',
        initialState: initialState.columnsFilter,
        options: {
            ...parseSerializeArrayString,
        },
    },
    aclMode: {
        stateKey: 'aclFilters.aclCurrentTab',
        initialState: initialState.aclCurrentTab,
    },
};

export function getAclFiltersPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(draft.aclFilters, 'approversSubject', query.aclFilters.approversSubject);
        updateIfChanged(draft.aclFilters, 'objectSubject', query.aclFilters.objectSubject);
        updateIfChanged(draft.aclFilters, 'objectPermissions', query.aclFilters.objectPermissions);
        updateIfChanged(draft.aclFilters, 'columnsFilter', query.aclFilters.columnsFilter);
        updateIfChanged(draft.aclFilters, 'aclCurrentTab', query.aclFilters.aclCurrentTab);
    });
}
