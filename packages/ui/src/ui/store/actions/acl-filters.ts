import {type ThunkAction} from 'redux-thunk';
import {selectAclFilterExpandedSubjects} from '../../store/selectors/acl/acl-filters';
import {ACL_CHANGE_FILTERS} from '../../constants/acl';

import {type AclFiltersAction, type AclFiltersState} from '../reducers/acl/acl-filters';
import {type RootState} from '../../store/reducers';

export function changeApproversSubjectFilter({
    approversSubject,
}: Pick<AclFiltersState, 'approversSubject'>) {
    return {
        type: ACL_CHANGE_FILTERS,
        data: {approversSubject},
    };
}

export function updateAclFilters(data: Partial<AclFiltersState>) {
    return {type: ACL_CHANGE_FILTERS, data};
}

type AclFilterThunkAction = ThunkAction<void, RootState, unknown, AclFiltersAction>;

export function toggleExpandAclSubject(subject?: string | number): AclFilterThunkAction {
    return (dispatch, getState) => {
        if (!subject) {
            return;
        }

        const expandedSubjects = new Set(selectAclFilterExpandedSubjects(getState()));
        if (expandedSubjects.has(subject)) {
            expandedSubjects.delete(subject);
        } else {
            expandedSubjects.add(subject);
        }
        dispatch({type: ACL_CHANGE_FILTERS, data: {expandedSubjects}});
    };
}
