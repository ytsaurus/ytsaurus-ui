import {YTPermissionType} from '../../../shared/yt-types';
import {YTPermissionTypeUI} from './acl-api';
import {PreparedRole, SubjectGroupType} from './index';

export type IdmKindType =
    | 'ui_effective_acl' // ui specific type, used to read @effective_acl
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
    group: string;
    group_name?: string;
    group_type?: string;

    // url is link to staff or abc page for this subject.
    url?: string;
}

interface TvmSubject {
    tvm_id: string;
    tvm_app_name?: string;
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
    column_group_id?: string;
    permissions?: Array<YTPermissionType>;
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
    deprive_after_days?: number;
}

export type RoleConverted = ResponsibleType & {
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
    group?: string;
};

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
    column_groups: Array<AclColumnGroup>;
}

export interface ACL {
    inherit_acl: boolean;
    acl: Array<ACE>;
}

export interface AclColumnGroup {
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
    permissions: Array<YTPermissionType>;
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
}

export interface GetAclParams extends AclRequestParams {}

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
    column_groups: Array<AclColumnGroup>;
}

export type TypedAclSubject =
    | {
          subjectType?: never;
          subjectUrl?: never;
          types: Array<string>;
          internal: boolean;
          groupInfo?: undefined;
      }
    | {
          subjectType: 'group';
          subjectUrl?: never;
          groupInfo: {
              name?: string;
              url?: string;
              group: string;
          };
          tvmInfo?: undefined;
          types?: undefined;
          internal?: undefined;
      }
    | {
          subjectType: 'tvm';
          subjectUrl?: string;
          tvmInfo?: {
              name?: string;
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

export type InheritedFrom = {kind: IdmKindType; name: string; poolTree?: string};

export type PreparedAclSubject = TypedAclSubject & {
    inheritance_mode?: string;
    inherited?: boolean;
    inheritedFrom?: InheritedFrom;
    key?: string;
    permissions?: Array<YTPermissionTypeUI>;
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
    vital?: boolean;
    group_type?: SubjectGroupType;

    type?: 'columns';
};

export type ResponsibleType =
    | {type: 'users'; value: string}
    | {type: 'groups'; value: string; group_name?: string}
    | {type: 'app'; value: string};

export interface UpdateAclParams {
    idmKind: IdmKindType;
    responsible?: Array<ResponsibleType>;
    auditors?: Array<ResponsibleType>;
    bossApproval?: boolean;
    readApprovers?: Array<ResponsibleType>;
    disableInheritance?: boolean;
    inheritAcl?: boolean;
    version?: string;
    poolTree?: string;
    comment?: string;
}
