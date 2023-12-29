import {PreparedRole} from './index';

export type IdmKindType =
    | 'path'
    | 'account'
    | 'pool'
    | 'tablet_cell_bundle'
    | 'access_control_object';

export interface Group {
    members?: Array<Subject>;
    responsible?: Array<Subject>;
    other_members?: Array<string>;
}

interface GroupSubject {
    group: number;
    group_name: string;

    // url is link to staff or abc page for this subject.
    url: string;
}

interface TvmSubject {
    tvm_id: string;
}

interface UserSubject {
    user: string;
}

export type Subject = (GroupSubject | TvmSubject | UserSubject) & {name?: string};

export interface GetGroupResponse {
    group: Group;
    version: string;
}

export interface UpdateResponse {
    status: Array<RoleUpdateStatus>;
}

export interface RoleUpdateStatus {
    role: Role;
}

export interface Role {
    subject: Subject;
    role_key?: string;
    state?: string;
    role_type?: string;
    permissions?: Array<AclPermissionType>;
    inheritance_mode?: string;
    columns?: Array<string>;
    inherited?: boolean;
    member?: boolean;
    idm_link?: string;
    deprive_date?: string;
    is_depriving?: boolean;
    is_requested?: boolean;
    is_approved?: boolean;
    is_unrecognized?: boolean;
    is_missing?: boolean;
    vital?: boolean;
}

export interface RoleConverted {
    idmLink?: string;
    inherited?: boolean;
    isApproved?: boolean;
    isDepriving?: boolean;
    isMissing?: boolean;
    isRequested?: boolean;
    isUnrecognized?: boolean;
    key?: string;
    role_type?: string;
    state?: string;
    text: string;
    type: string;
    value?: string;
    group?: string;
}

export type AclPermissionType = string;

export interface ResponsibleSettingsV2 {
    responsible: Array<Role>;
    read_approvers: Array<Role>;
    auditors: Array<Role>;

    require_boss_approval: Role;
    disable_inheritance: Role;
}

export interface GetResponsibleV2Response {
    responsible: ResponsibleSettingsV2;
    // is_responsible is set to true, if current user is responsible.
    is_responsible: boolean;
    // version
    version: string;
    disable_acl_inheritance: Role;
}

export interface GroupACL {
    // other_members is set of system users and groups, not managed by IDM.
    other_members?: Array<string>;
    responsible?: Array<PreparedRole>;
    members?: Array<PreparedRole>;
}

export interface GetACLResponse {
    acl: ACL;
    roles: Array<Role>;
    column_groups: Array<ColumnGroup>;
}

export interface ACL {
    inherit_acl: boolean;
    acl: Array<ACE>;
}

export interface ColumnGroup {
    id: string;
    name: string;
    columns?: Array<string>;
    enabled?: boolean;
    removed?: boolean;
}

export interface SuccessColumnGroupCreate {
    guid: string;
}

export interface ACE {
    permissions: Array<AclPermissionType>;
    action: string;
    subjects: Array<string>;
    inheritance_mode?: string;
    columns?: Array<string>;
    inherited?: boolean;
}

export interface AclRequestParams {
    cluster: string;
    path: string;
    kind: IdmKindType;
    poolTree?: string;
    sysPath: string;
    useEffective?: boolean;
    aclType: ACLType;
}

export interface GetAclParams extends AclRequestParams {
    useEffective?: boolean;
}

export interface GetResponsibleParams extends AclRequestParams {
    skipResponsible?: boolean;
}

export interface ACLResponsible {
    version?: string;
    disableAclInheritance?: boolean | PreparedRole;
    bossApproval?: PreparedRole;
    disableInheritanceResponsible?: PreparedRole;

    auditors?: Array<PreparedRole>;
    responsible?: Array<PreparedRole>;
    readApprovers?: Array<PreparedRole>;
}

export interface PreparedAclData {
    permissions: Array<PreparedAclSubject>;
    column_groups: Array<ColumnGroup>;
}

export type TypedAclSubject =
    | {
          subjectType?: never;
          subjectUrl?: never;
          types: Array<string>;
          internal: boolean;
      }
    | {
          subjectType: 'group';
          subjectUrl?: never;
          groupInfo: {
              name: string;
              url: string;
              group: number;
          };
          tvmInfo?: undefined;
          types?: undefined;
          internal?: undefined;
      }
    | {
          subjectType: 'tvm';
          subjectUrl?: string;
          tvmInfo: {
              name: string;
          };
          groupInfo?: undefined;
          types?: undefined;
          internal?: undefined;
      }
    | {
          subjectType: 'user';
          subjectUrl?: string;
          groupInfo?: undefined;
          tvmInfo?: undefined;
          types?: undefined;
          internal?: undefined;
      };

export type PreparedAclSubject = TypedAclSubject & {
    inheritance_mode?: string;
    inherited?: boolean;
    key?: string;
    permissions?: Array<AclPermissionType>;
    subjects: Array<string | number>;
    action?: string;
    group?: string;
    columns?: Role['columns'];
    state?: string;
    idmLink?: string;
    depriveDate?: string;
    isDepriving?: boolean;
    isRequested?: boolean;
    isApproved?: boolean;
    isUnrecognized?: boolean;
    isMissing?: boolean;
    revision?: number;
    aclIndex?: number;
    isSplitted?: boolean;
    subjectIndex?: number;
};

export type ResponsibleType = {type: 'users' | 'groups'; value: string};

export interface UpdateAclParams {
    idmKind: IdmKindType;
    responsible?: Array<ResponsibleType>;
    auditors?: Array<ResponsibleType>;
    bossApproval?: Array<ResponsibleType>;
    readApprovers?: Array<ResponsibleType>;
    disableInheritance?: boolean;
    inheritAcl?: boolean;
    version?: string;
    poolTree?: string;
    comment?: string;
}

export type ACLType = '@acl' | '@principal_acl';
