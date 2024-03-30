import {YTPermissionTypeUI} from '../../../utils/acl/acl-api';
import {ACL_CHANGE_FILTERS, AclMode} from '../../../constants/acl';

import type {ActionD} from '../../../types';
import {EMPTY_ARRAY} from '../../../constants/empty';

export interface AclFiltersState {
    approversSubject: string;
    objectSubject: string;
    objectPermissions: Array<YTPermissionTypeUI>;
    columnsFilter: Array<string>;
    columnGroupNameFilter: string;

    aclCurrentTab: AclMode;
}

export const initialState: AclFiltersState = {
    approversSubject: '',
    objectSubject: '',
    objectPermissions: [],
    columnsFilter: EMPTY_ARRAY,
    columnGroupNameFilter: '',

    aclCurrentTab: AclMode.MAIN_PERMISSIONS,
};

export default (state = initialState, action: AclFiltersAction): AclFiltersState => {
    switch (action.type) {
        case ACL_CHANGE_FILTERS: {
            return {...state, ...action.data};
        }
        default:
            return state;
    }
};

type AclFiltersAction = ActionD<typeof ACL_CHANGE_FILTERS, Partial<AclFiltersState>>;
