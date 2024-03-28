import {Action} from 'redux';
import {YTError} from '../../../../@types/types';
import {CheckPermissionResult} from '../../../../shared/utils/check-permission';
import {
    DELETE_PERMISSION,
    IdmObjectType,
    LOAD_DATA,
    REQUEST_PERMISSION,
    UPDATE_ACL,
} from '../../../constants/acl';
import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../../constants/utils';
import {YTPermissionTypeUI} from '../../../utils/acl/acl-api';
import {AclColumnGroup, IdmKindType, PreparedAclSubject} from '../../../utils/acl/acl-types';
import {ActionD} from '../../../types';
import {PreparedRole} from '../../../utils/acl';

export type AclKindState = {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: YTError | undefined;

    path: string;
    userPermissions: Array<{type: YTPermissionTypeUI} & CheckPermissionResult>;
    objectPermissions: Array<PreparedAclSubject>;
    columnGroups: Array<AclColumnGroup>;
    inheritAcl: boolean;

    bossApproval: PreparedRole | undefined;
    disableAclInheritance: boolean | PreparedRole | undefined;
    disableInheritanceResponsible: boolean | PreparedRole | undefined;
    auditors: Array<PreparedRole> | undefined;
    readApprovers: Array<PreparedRole> | undefined;
    responsible: Array<PreparedRole> | undefined;
    version: string | undefined;

    isPermissionDeleted: boolean;
    deletionError: YTError | undefined;
    deletedItemKey: string | undefined;

    idmPermissionsRequestError: YTError | undefined;
    idmManageAclRequestError: YTError | undefined;
};

const ephemeralState: AclKindState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,

    path: '//',
    userPermissions: [],
    objectPermissions: [],
    columnGroups: [],
    inheritAcl: false,
    bossApproval: undefined,
    disableAclInheritance: false,
    disableInheritanceResponsible: false,
    auditors: [],
    readApprovers: [],
    responsible: [],
    version: '',

    isPermissionDeleted: false,
    deletionError: undefined,
    deletedItemKey: undefined,

    idmPermissionsRequestError: undefined,
    idmManageAclRequestError: undefined,
};

export const aclDefaults = {
    ...ephemeralState,
};

export type AclState = Record<IdmKindType, AclKindState>;

const initialState: AclState = {
    [IdmObjectType.ACCESS_CONTROL_OBJECT]: {...aclDefaults},
    [IdmObjectType.PATH]: {...aclDefaults},
    [IdmObjectType.UI_EFFECTIVE_ACL]: {...aclDefaults},
    [IdmObjectType.ACCOUNT]: {...aclDefaults},
    [IdmObjectType.POOL]: {...aclDefaults},
    [IdmObjectType.TABLET_CELL_BUNDLE]: {...aclDefaults},
};

function modifyFieldState(state: AclState, field: IdmKindType, fieldData: Partial<AclKindState>) {
    const mergedFieldData = {...state[field], ...fieldData};
    return {...state, [field]: mergedFieldData};
}

export default (state = initialState, action: AclAction) => {
    switch (action.type) {
        case DELETE_PERMISSION.REQUEST:
            return modifyFieldState(state, action.idmKind, {
                isPermissionDeleted: true,
                deletedItemKey: action.data,
                deletionError: undefined,
            });

        case DELETE_PERMISSION.SUCCESS: {
            return modifyFieldState(state, action.idmKind, {
                isPermissionDeleted: false,
            });
        }

        case DELETE_PERMISSION.CANCELLED:
            return modifyFieldState(state, action.idmKind, {
                isPermissionDeleted: false,
            });

        case DELETE_PERMISSION.FAILURE:
            return modifyFieldState(state, action.idmKind, {
                isPermissionDeleted: false,
                deletionError: action.data,
            });

        case LOAD_DATA.REQUEST:
            return modifyFieldState(state, action.idmKind, {loading: true});

        case LOAD_DATA.SUCCESS: {
            const {
                path,
                objectPermissions,
                columnGroups,
                userPermissions,
                disableAclInheritance,
                bossApproval,
                disableInheritanceResponsible,
                auditors,
                responsible,
                version,
                readApprovers,
            } = action.data;

            return modifyFieldState(state, action.idmKind, {
                path,
                version,
                disableAclInheritance,
                bossApproval,
                disableInheritanceResponsible,
                auditors,
                responsible,
                userPermissions,
                objectPermissions,
                columnGroups,
                readApprovers,
                loading: false,
                loaded: true,
                error: false,
            });
        }

        case LOAD_DATA.FAILURE:
            return modifyFieldState(state, action.idmKind, {
                loading: false,
                error: true,
                errorData: action.data.error,
            });

        case LOAD_DATA.CANCELLED:
            return modifyFieldState(state, action.idmKind, {loading: false});

        case REQUEST_PERMISSION.REQUEST:
        case REQUEST_PERMISSION.CANCELLED:
        case REQUEST_PERMISSION.SUCCESS:
            return modifyFieldState(state, action.idmKind, {
                idmPermissionsRequestError: undefined,
            });

        case REQUEST_PERMISSION.FAILURE:
            return modifyFieldState(state, action.idmKind, {
                idmPermissionsRequestError: action.data,
            });

        case UPDATE_ACL.REQUEST:
        case UPDATE_ACL.CANCELLED:
        case UPDATE_ACL.SUCCESS:
            return modifyFieldState(state, action.idmKind, {
                idmManageAclRequestError: undefined,
            });

        case UPDATE_ACL.FAILURE:
            return modifyFieldState(state, action.idmKind, {
                idmManageAclRequestError: action.data,
            });

        case RESET_STORE_BEFORE_CLUSTER_CHANGE: {
            return initialState;
        }
        default:
            return state;
    }
};

export type HasIdmKind = {idmKind: IdmKindType};

export type AclActionType =
    | Action<typeof LOAD_DATA.REQUEST | typeof LOAD_DATA.CANCELLED>
    | ActionD<typeof LOAD_DATA.FAILURE, {error: AclKindState['errorData']}>
    | ActionD<
          typeof LOAD_DATA.SUCCESS,
          Pick<
              AclKindState,
              | 'path'
              | 'version'
              | 'auditors'
              | 'objectPermissions'
              | 'columnGroups'
              | 'userPermissions'
              | 'disableAclInheritance'
              | 'bossApproval'
              | 'disableInheritanceResponsible'
              | 'responsible'
              | 'readApprovers'
          >
      >
    | Action<typeof DELETE_PERMISSION.SUCCESS | typeof DELETE_PERMISSION.CANCELLED>
    | ActionD<typeof DELETE_PERMISSION.FAILURE, AclKindState['deletionError']>
    | ActionD<typeof DELETE_PERMISSION.REQUEST, AclKindState['deletedItemKey']>
    | Action<
          | typeof REQUEST_PERMISSION.REQUEST
          | typeof REQUEST_PERMISSION.SUCCESS
          | typeof REQUEST_PERMISSION.CANCELLED
      >
    | ActionD<typeof REQUEST_PERMISSION.FAILURE, AclKindState['idmPermissionsRequestError']>
    | Action<typeof UPDATE_ACL.REQUEST | typeof UPDATE_ACL.SUCCESS | typeof UPDATE_ACL.CANCELLED>
    | ActionD<typeof UPDATE_ACL.FAILURE, AclKindState['idmManageAclRequestError']>
    | Action<typeof RESET_STORE_BEFORE_CLUSTER_CHANGE>;

export type AclAction = HasIdmKind & AclActionType;
