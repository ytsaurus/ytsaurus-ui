import React from 'react';
import {
    ManageAclFieldsNames,
    ManageInheritanceFieldNames,
} from '../../containers/ACL/ManageAcl/ManageAcl';
import {RequestPermissionsFieldsNames} from '../../containers/ACL/RequestPermissions/RequestPermissions';
import {
    deleteAclItemOrSubjectByIndex,
    getCombinedAcl,
    requestPermissions,
    updateAclAttributes,
} from './acl-api';
import {
    ACLResponsible,
    AclColumnGroup,
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
import {PreparedApprover} from '../../store/selectors/acl';

export interface AclApi {
    isAllowed: boolean;

    getAcl(params: GetAclParams): Promise<PreparedAclData>;
    updateAcl(cluster: string, path: string, params: UpdateAclParams): Promise<UpdateResponse>;
    manageAclFields: Array<ManageAclFieldsNames>;
    manageInheritanceFields: Array<ManageInheritanceFieldNames>;

    getGroupAcl(cluster: string, group: string): Promise<{group: GroupACL; version: string}>;
    updateGroup(params: UpdateGroupParams): Promise<UpdateResponse>;
    addUserToGroup(params: AdduserToGroupParams): Promise<UpdateResponse>;
    removeUserFromGroup(params: AdduserToGroupParams): Promise<UpdateResponse>;

    getResponsible(params: GetResponsibleParams): Promise<ACLResponsible>;

    requestPermissions(params: RequestPermissionParams): Promise<UpdateResponse>;
    requestPermissionsFields: Array<RequestPermissionsFieldsNames>;
    requestPermissionsFlags?: Record<
        string,
        {
            title: String;
            applyToRequestedRole: (role: Role, value?: boolean) => void;
            renderIcon: (dst: PreparedAclSubject | PreparedApprover) => React.ReactNode;
            help?: React.ReactNode;
            initialValue?: boolean;
        }
    >;

    deleteRole(params: {
        path: string;
        sysPath: string;
        cluster: string;
        roleKey: string;
        itemToDelete: PreparedAclSubject;
        idmKind: IdmKindType;
    }): Promise<UpdateResponse>;

    createColumnGroup(
        cluster: string,
        path: string,
        data: Partial<AclColumnGroup>,
    ): Promise<SuccessColumnGroupCreate>;
    editColumnGroup(cluster: string, columnGroupValue: Partial<AclColumnGroup>): Promise<void>;
    deleteColumnGroup(cluster: string, id: string): Promise<void>;

    buttonsTitle?: {
        editAcl?: string;
        editInheritance?: string;
        editColumnsAcl?: string;
    };
}

export interface GetAclParams {
    cluster: string;
    path: string;
    sysPath: string;
    kind: IdmKindType;
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
    sysPath: string;
    roles: Array<Role>;
    roles_grouped: Array<Role>;
    comment: string;
    /*columns, */ kind: IdmKindType;
    poolTree?: string;
    columns?: Array<string>;
}

export const defaultAclApi: AclApi = {
    isAllowed: false,

    getAcl: ({sysPath, kind}) => getCombinedAcl({sysPath, kind}),
    updateAcl: (...args) => updateAclAttributes(...args),
    manageAclFields: [],
    manageInheritanceFields: ['inheritAcl', 'inheritAcl_warning'],

    getGroupAcl: () => methodNotSupported('getGroupAcl'),
    updateGroup: () => methodNotSupported('updateGruop'),
    addUserToGroup: () => methodNotSupported('addUserToGroup'),
    removeUserFromGroup: () => methodNotSupported('removeUserFromGroup'),

    getResponsible: () => methodNotSupported('getResponsible'),

    requestPermissions: (params) => requestPermissions(params),
    requestPermissionsFields: [
        'cluster',
        'path',
        'permissions',
        'readColumns',
        'inheritance_mode',
        'subjects',
    ],

    deleteRole: ({sysPath, itemToDelete, idmKind}) => {
        return deleteAclItemOrSubjectByIndex({sysPath, itemToDelete, idmKind});
    },

    createColumnGroup: () => methodNotSupported('createColumnGroup'),
    editColumnGroup: () => methodNotSupported('editColumnGroup'),
    deleteColumnGroup: () => methodNotSupported('deleteColumnGroup'),
};

function methodNotSupported(method: string) {
    return Promise.reject(new Error(`"${method}" method is not supported`));
}
