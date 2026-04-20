import {createSelector} from 'reselect';
import {type RootState} from '../reducers';
import {ACL_MODES, AclMode} from '../../constants/acl';

export function getExecuteBatchState(state: RootState) {
    return state.executeBatch;
}

export const getApproversSubjectFilter = (state: RootState) => state.aclFilters.approversSubject;
export const getObjectSubjectFilter = (state: RootState) => state.aclFilters.objectSubject;
export const getObjectPermissionsFilter = (state: RootState) => state.aclFilters.objectPermissions;
export const getAclFilterColumns = (state: RootState) => state.aclFilters.columnsFilter;
export const getAclFilterColumnGroupName = (state: RootState) =>
    state.aclFilters.columnGroupNameFilter;
export const getAclFilterRowGroupName = (state: RootState) => state.aclFilters.rowGroupNameFilter;
export const getAclFilterExpandedSubjects = (state: RootState) => state.aclFilters.expandedSubjects;
const getAclCurrentTabRaw = (state: RootState) => state.aclFilters.aclCurrentTab;
export const getAclCurrentTab = createSelector([getAclCurrentTabRaw], (value) => {
    return -1 !== ACL_MODES.indexOf(value) ? value : AclMode.MAIN_PERMISSIONS;
});
export const getAclRowAccessPredicateFilter = (state: RootState) =>
    state.aclFilters.rowAccessPredicateFilter;
