import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import {type RootState} from '..';
import {YTPermissionTypeUI} from '../../../utils/acl/acl-api';

type OperationAclFiltersState = {
    subjectFilter: string;
    permissionsFilter: Array<YTPermissionTypeUI>;
};

export const initialState: OperationAclFiltersState = {
    subjectFilter: '',
    permissionsFilter: [],
};

const aclFiltersSlice = createSlice({
    name: 'acl-filters',
    initialState,
    reducers: {
        setSubjectFilter: (
            state,
            {payload}: PayloadAction<Pick<OperationAclFiltersState, 'subjectFilter'>>,
        ) => ({
            ...state,
            ...payload,
        }),
        setPermissionsFilter: (
            state,
            {payload}: PayloadAction<Pick<OperationAclFiltersState, 'permissionsFilter'>>,
        ) => ({
            ...state,
            ...payload,
        }),
    },
    selectors: {
        getSubjectFilter: (state) => state.subjectFilter,
        getPermissionsFilter: (state) => state.permissionsFilter,
    },
});

export const aclFilters = aclFiltersSlice.reducer;
export const {setSubjectFilter, setPermissionsFilter} = aclFiltersSlice.actions;
export const {getSubjectFilter, getPermissionsFilter} = aclFiltersSlice.getSelectors(
    (state: RootState) => state.operations.aclFilters,
);
