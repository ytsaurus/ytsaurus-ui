import {ThunkAction} from 'redux-thunk';
import {getAclFilterExpandedSubjects} from '../../store/selectors/acl-filters';
import {ACL_CHANGE_FILTERS} from '../../constants/acl';

import {AclFiltersAction, AclFiltersState} from '../reducers/acl/acl-filters';
import {RootState} from '../../store/reducers';

export function changeApproversSubjectFilter({
    approversSubject,
}: Pick<AclFiltersState, 'approversSubject'>) {
    return {
        type: ACL_CHANGE_FILTERS,
        data: {approversSubject},
    };
}

export function changeObjectSubjectFilter({objectSubject}: Pick<AclFiltersState, 'objectSubject'>) {
    return {
        type: ACL_CHANGE_FILTERS,
        data: {objectSubject},
    };
}

export function changeObjectPermissionsFilter({
    objectPermissions,
}: Pick<AclFiltersState, 'objectPermissions'>) {
    return {
        type: ACL_CHANGE_FILTERS,
        data: {objectPermissions},
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

        const expandedSubjects = new Set(getAclFilterExpandedSubjects(getState()));
        if (expandedSubjects.has(subject)) {
            expandedSubjects.delete(subject);
        } else {
            expandedSubjects.add(subject);
        }
        dispatch({type: ACL_CHANGE_FILTERS, data: {expandedSubjects}});
    };
}
