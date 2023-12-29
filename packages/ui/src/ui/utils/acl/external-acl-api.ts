import {ManageAclFieldsNames} from '../../components/ACL/ManageAcl/ManageAcl';
import {RequestPermissionsFieldsNames} from '../../components/ACL/RequestPermissions/RequestPermissions';
import {
    deleteAclItemOrSubjectByIndex,
    getCombinedAcl,
    requestPermissions,
    updateAclAttributes,
} from './acl-api';
import {
    ACLResponsible,
    ACLType,
    ColumnGroup,
    Group,
    GroupACL,
    IdmKindType,
    PreparedAclData,
    PreparedAclSubject,
    Role,
    SuccessColumnGroupCreate,
    UpdateAclParams,
    UpdateResponse,
} from './acl-types';

export interface AclApi {
    isAllowed: boolean;

    getAcl(params: GetAclParams): Promise<PreparedAclData>;
    updateAcl(cluster: string, path: string, params: UpdateAclParams): Promise<UpdateResponse>;
    manageAclFields: Array<ManageAclFieldsNames>;

    getGroupAcl(cluster: string, group: string): Promise<{group: GroupACL; version: string}>;
    updateGroup(params: UpdateGroupParams): Promise<UpdateResponse>;
    addUserToGroup(params: AdduserToGroupParams): Promise<UpdateResponse>;
    removeUserFromGroup(params: AdduserToGroupParams): Promise<UpdateResponse>;

    getResponsible(params: GetResponsibleParams): Promise<ACLResponsible>;

    requestPermissions(params: RequestPermissionParams): Promise<UpdateResponse>;
    requestPermissionsFields: Array<RequestPermissionsFieldsNames>;

    deleteRole(params: {
        path: string;
        sysPath: string;
        cluster: string;
        roleKey: string;
        itemToDelete: PreparedAclSubject;
        idmKind: IdmKindType;
        aclType: ACLType;
    }): Promise<UpdateResponse>;

    createColumnGroup(
        cluster: string,
        path: string,
        data: Partial<ColumnGroup>,
    ): Promise<SuccessColumnGroupCreate>;
    editColumnGroup(cluster: string, columnGroupValue: Partial<ColumnGroup>): Promise<void>;
    deleteColumnGroup(cluster: string, id: string): Promise<void>;
}

export interface GetAclParams {
    cluster: string;
    path: string;
    sysPath: string;
    kind: string;
    poolTree?: string;
    aclType: ACLType;
}

export interface UpdateGroupParams {
    cluster: string;
    groupName: string;
    version: string;
    groupDiff: Partial<Group>;
    comment?: string;
}

export interface AdduserToGroupParams {
    cluster: string;
    username: string;
    groupname: string;
    comment?: string;
}

export interface GetResponsibleParams {
    cluster: string;
    path: string;
    kind: IdmKindType;
    poolTree?: string;
}

export interface RequestPermissionParams {
    cluster: string;
    path: string;
    sysPath: string;
    roles: Array<Role>;
    roles_grouped: Array<Role>;
    comment: string;
    /*columns, */ kind: IdmKindType;
    poolTree?: string;
    aclType: ACLType;
}

export const defaultAclApi: AclApi = {
    isAllowed: false,

    getAcl: ({sysPath, aclType}) => getCombinedAcl({sysPath, aclType}),
    updateAcl: (...args) => updateAclAttributes(...args),
    manageAclFields: ['inheritAcl', 'inheritAcl_warning'],

    getGroupAcl: () => methodNotSupported('getGroupAcl'),
    updateGroup: () => methodNotSupported('updateGruop'),
    addUserToGroup: () => methodNotSupported('addUserToGroup'),
    removeUserFromGroup: () => methodNotSupported('removeUserFromGroup'),

    getResponsible: () => methodNotSupported('getResponsible'),

    requestPermissions: (params) => requestPermissions(params),
    requestPermissionsFields: ['cluster', 'path', 'permissions', 'inheritance_mode', 'subjects'],

    deleteRole: ({sysPath, itemToDelete, idmKind, aclType}) => {
        return deleteAclItemOrSubjectByIndex({sysPath, itemToDelete, idmKind, aclType});
    },

    createColumnGroup: () => methodNotSupported('createColumnGroup'),
    editColumnGroup: () => methodNotSupported('editColumnGroup'),
    deleteColumnGroup: () => methodNotSupported('deleteColumnGroup'),
};

function methodNotSupported(method: string) {
    return Promise.reject(new Error(`"${method}" method is not supported`));
}
