import {type LocationParameters} from '../../../store/location';
import {initialState} from './acl-filters';

export const operationAclFiltersParams: LocationParameters = {
    subject: {
        stateKey: 'operations.aclFilters.subjectFilter',
        initialState: initialState.subjectFilter,
    },
    permissions: {
        stateKey: 'operations.aclFilters.permissionsFilter',
        initialState: initialState.permissionsFilter,
        type: 'array',
    },
};
