import {YTPermissionTypeUI} from '../../../utils/acl/acl-api';
import {ACL_CHANGE_FILTERS} from '../../../constants/acl';

import type {ActionD} from '../../../types';

export interface AclFiltersState {
    approversSubject: string;
    objectSubject: string;
    objectPermissions: Array<YTPermissionTypeUI>;
    columnsColumns: string;
}

export const initialState: AclFiltersState = {
    approversSubject: '',
    objectSubject: '',
    objectPermissions: [],
    columnsColumns: '',
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
