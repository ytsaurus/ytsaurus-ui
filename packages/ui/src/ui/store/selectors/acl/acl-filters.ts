import {createSelector} from 'reselect';
import {type RootState} from '../../../store/reducers';
import {ACL_MODES, AclMode} from '../../../constants/acl';

export const selectApproversSubjectFilter = (state: RootState) => state.aclFilters.approversSubject;

export const selectObjectSubjectFilter = (state: RootState) => state.aclFilters.objectSubject;

export const selectObjectPermissionsFilter = (state: RootState) =>
    state.aclFilters.objectPermissions;

export const selectAclFilterColumns = (state: RootState) => state.aclFilters.columnsFilter;

export const selectAclFilterColumnGroupName = (state: RootState) =>
    state.aclFilters.columnGroupNameFilter;

export const selectAclFilterRowGroupName = (state: RootState) =>
    state.aclFilters.rowGroupNameFilter;

export const selectAclFilterExpandedSubjects = (state: RootState) =>
    state.aclFilters.expandedSubjects;

const selectAclCurrentTabRaw = (state: RootState) => state.aclFilters.aclCurrentTab;

export const selectAclCurrentTab = createSelector([selectAclCurrentTabRaw], (value) => {
    return -1 !== ACL_MODES.indexOf(value) ? value : AclMode.MAIN_PERMISSIONS;
});

export const selectAclRowAccessPredicateFilter = (state: RootState) =>
    state.aclFilters.rowAccessPredicateFilter;
