import produce from 'immer';
import {RootState} from '../../../../../store/reducers';
import {aclDefaults} from '../../../../../store/reducers/acl/acl';
import {updateIfChanged} from '../../../../../utils/utils';

const initialObjectSubject = aclDefaults.objectSubject;
const initialColumnsSubject = aclDefaults.columnsSubject;
const initialColumnsColumns = aclDefaults.columnsColumns;

export const aclParams = {
    oSubject: {
        stateKey: 'acl.path.objectSubject',
        initialState: initialObjectSubject,
    },
    cSubject: {
        stateKey: 'acl.path.columnsSubject',
        initialState: initialColumnsSubject,
    },
    cColumns: {
        stateKey: 'acl.path.columnsColumns',
        initialState: initialColumnsColumns,
    },
};

export function getNavigationAclPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(draft.acl.path, 'objectSubject', query.acl.path.objectSubject);
        updateIfChanged(draft.acl.path, 'columnsSubject', query.acl.path.columnsSubject);
        updateIfChanged(draft.acl.path, 'columnsColumns', query.acl.path.columnsColumns);
    });
}
