import {
    ACLResponsible,
    ColumnGroup,
    Group,
    GroupACL,
    IdmKindType,
    PreparedAclData,
    Role,
    SuccessColumnGroupCreate,
    UpdateAclParams,
    UpdateResponse,
} from './acl-types';

export interface AclApi {
    isAllowed: boolean;

    getAcl(params: GetAclParams): Promise<PreparedAclData>;
    updateAcl(cluster: string, path: string, params: UpdateAclParams): Promise<UpdateResponse>;

    getGroupAcl(cluster: string, group: string): Promise<{group: GroupACL; version: string}>;
    updateGroup(params: UpdateGroupParams): Promise<UpdateResponse>;
    addUserToGroup(params: AdduserToGroupParams): Promise<UpdateResponse>;
    removeUserFromGroup(params: AdduserToGroupParams): Promise<UpdateResponse>;

    getResponsible(params: GetResponsibleParams): Promise<ACLResponsible>;

    requestPermissions(params: RequestPermissionParams): Promise<UpdateResponse>;

    deleteRole(cluster: string, roleKey: string): Promise<UpdateResponse>;

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
    kind: string;
    poolTree?: string;
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
    roles: Array<Role>;
    comment: string;
    /*columns, */ kind: IdmKindType;
    poolTree?: string;
}

export const defaultAclApi: AclApi = {
    isAllowed: false,

    getAcl: () => methodNotSupported('getAcl'),
    updateAcl: () => methodNotSupported('updateAcl'),

    getGroupAcl: () => methodNotSupported('getGroupAcl'),
    updateGroup: () => methodNotSupported('updateGruop'),
    addUserToGroup: () => methodNotSupported('addUserToGroup'),
    removeUserFromGroup: () => methodNotSupported('removeUserFromGroup'),

    getResponsible: () => methodNotSupported('getResponsible'),

    requestPermissions: () => methodNotSupported('requestPermission'),

    deleteRole: () => methodNotSupported('deleteRole'),

    createColumnGroup: () => methodNotSupported('createColumnGroup'),
    editColumnGroup: () => methodNotSupported('editColumnGroup'),
    deleteColumnGroup: () => methodNotSupported('deleteColumnGroup'),
};

function methodNotSupported(method: string) {
    return Promise.reject(new Error(`"${method}" method is not supported`));
}
