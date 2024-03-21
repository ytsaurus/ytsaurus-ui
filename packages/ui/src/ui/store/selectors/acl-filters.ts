import {RootState} from '../reducers';

export function getExecuteBatchState(state: RootState) {
    return state.executeBatch;
}

export const getApproversSubjectFilter = (state: RootState) => state.aclFilters.approversSubject;
export const getObjectSubjectFilter = (state: RootState) => state.aclFilters.objectSubject;
export const getObjectPermissionsFilter = (state: RootState) => state.aclFilters.objectPermissions;
export const getColumnsColumns = (state: RootState) => state.aclFilters.columnsColumns;
export const getAclCurrentTab = (state: RootState) => state.aclFilters.aclCurrentTab;
