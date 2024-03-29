import {ACL_CHANGE_FILTERS} from '../../constants/acl';

import {AclFiltersState} from '../reducers/acl/acl-filters';

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
