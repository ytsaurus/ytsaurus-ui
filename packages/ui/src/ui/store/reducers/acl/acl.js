import {
    CHANGE_COLUMNS_COLUMNS,
    CHANGE_OBJECT_SUBJECT,
    DELETE_PERMISSION,
    LOAD_DATA,
    REQUEST_PERMISSION,
    UPDATE_ACL,
    IdmObjectType,
} from '../../../constants/acl';
import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../../constants/utils';

const ephemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},

    path: '//',
    userPermissions: [],
    objectPermissions: [],
    columnGroups: [],
    inheritAcl: false,
    bossApproval: false,
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

const persistedState = {
    objectSubject: '',
    columnsColumns: '',
    columnsSubject: '',
};

export const aclDefaults = {
    ...persistedState,
    ...ephemeralState,
};

const initialState = {
    [IdmObjectType.ACCESS_CONTROL_OBJECT]: {...aclDefaults},
    [IdmObjectType.PATH]: {...aclDefaults},
    [IdmObjectType.ACCOUNT]: {...aclDefaults},
    [IdmObjectType.POOL]: {...aclDefaults},
    [IdmObjectType.TABLET_CELL_BUNDLE]: {...aclDefaults},
};

function modifyFieldState(state, field, fieldData) {
    const mergedFieldData = {...state[field], ...fieldData};
    return {...state, [field]: mergedFieldData};
}

export default (state = initialState, action) => {
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

        case CHANGE_OBJECT_SUBJECT:
            return modifyFieldState(state, action.idmKind, {
                objectSubject: action.data.objectSubject,
            });

        case CHANGE_COLUMNS_COLUMNS:
            return modifyFieldState(state, action.idmKind, {
                columnsColumns: action.data.columnsColumns,
            });

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
            const {shouldUsePreserveState} = action.data;
            const fieldData = shouldUsePreserveState
                ? ephemeralState
                : {...ephemeralState, ...persistedState};
            const tmp = modifyFieldState(state, IdmObjectType.PATH, fieldData);

            return modifyFieldState(tmp, IdmObjectType.ACCOUNT, fieldData);
        }
        default:
            return state;
    }
};
