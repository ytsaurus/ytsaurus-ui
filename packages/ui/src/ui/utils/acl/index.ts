import {YTPermissionType} from '../../../shared/yt-types';
import {
    IdmObjectType,
    REGISTER_QUEUE_CONSUMER,
    REGISTER_QUEUE_CONSUMER_VITAL,
} from '../../constants/acl';
import {IdmKindType, InheritedFrom, ResponsibleType, Subject} from '../../utils/acl/acl-types';
import {YTPermissionTypeUI} from './acl-api';
import {makeRegexpFromSettings} from '../../../shared/utils';
import {uiSettings} from '../../config/ui-settings';

// //sys/accounts/accountName
const ACCOUNTS_REGEXP = new RegExp('//sys/accounts/.+');

// //sys/pool_trees/pool_tree/.../pool_name
const POOL_TREES_REGEXP = new RegExp('//sys/pool_trees/[^/]+/.+');

// //sys/tablet_cell_bundles/bundleName
const TCB_REGEXP = new RegExp('//sys/tablet_cell_bundles/.+');

interface NormalizedIdmParams {
    idmKind: IdmKindType;
    path: string;
    pool_tree?: string;
    userPermissionsPath?: string;
}

export function normalizeIdmParams(idmKind: IdmKindType, path = '') {
    let res: NormalizedIdmParams = {
        idmKind,
        path,
        pool_tree: undefined,
    };

    if (idmKind === IdmObjectType.PATH) {
        if (ACCOUNTS_REGEXP.test(path)) {
            res = {
                idmKind: IdmObjectType.ACCOUNT,
                path: path.substr('//sys/accounts/'.length),
            };
        } else if (POOL_TREES_REGEXP.test(path)) {
            const treePath = path.substr('//sys/pool_trees/'.length).split('/');
            res = {
                idmKind: IdmObjectType.POOL,
                path: treePath[treePath.length - 1],
                pool_tree: treePath[0],
            };
        } else if (TCB_REGEXP.test(path)) {
            res = {
                idmKind: IdmObjectType.TABLET_CELL_BUNDLE,
                path: path.substr('//sys/tablet_cell_bundles/'.length),
            };
        } else if (makeRegexpFromSettings(uiSettings.reUseEffectiveAclForPath)?.test(path)) {
            // //sys/access_control_object_namespaces...
            res = {
                idmKind: IdmObjectType.UI_EFFECTIVE_ACL,
                path: path,
            };
        }
    }

    if (idmKind === IdmObjectType.ACCESS_CONTROL_OBJECT) {
        res = {
            idmKind: idmKind,
            path: path,
            userPermissionsPath: `${path}/principal`,
        };
    }

    return res;
}

export type SubjectGroupType = 'service' | 'department' | string;

export interface PreparedRole {
    type?: 'users' | 'groups';
    subject: Subject;
    subjectUrl?: string;
    inherited?: boolean;
    inheritedFrom?: InheritedFrom;
    idmLink?: string;
    key?: string;
    group?: 'role' | string | number;
    value?: string | number;
    text?: string;
    isDepriving?: boolean;
    isRequested?: boolean;
    isApproved?: boolean;
    isUnrecognized?: boolean;
    isMissing?: boolean;

    group_name?: string;
    group_type?: SubjectGroupType;
    user?: string;
    name?: string;
    tvm_id?: string;

    state?: string;
    role_type?: string;
    permissions?: Array<YTPermissionTypeUI>;
    inheritance_mode?: string;
    columns?: Array<string>;
    member?: boolean;
    deprive_date?: string;

    internal?: boolean;

    url?: string;

    types?: undefined;
    subjectType?: undefined;
}

export function prepareAclSubject(item: ResponsibleType): Subject {
    switch (item.type) {
        case 'users':
            return {user: item.value};
        case 'groups':
            return {group: item.value};
        case 'app':
            return {tvm_id: item.value};
    }
}

export function convertToUIPermissions<
    T extends {permissions?: Array<YTPermissionType>; vital?: boolean},
>(role: T): Omit<T, 'permissions'> & {permissions?: Array<YTPermissionTypeUI>} {
    if (!role.vital || !role.permissions) {
        return role;
    }

    const uiPermissions: Array<YTPermissionTypeUI> = role.permissions.map((item) => {
        return item === REGISTER_QUEUE_CONSUMER ? REGISTER_QUEUE_CONSUMER_VITAL : item;
    });
    return {
        ...role,
        permissions: uiPermissions,
    };
}

export function convertFromUIPermissions<
    T extends {permissions: Array<YTPermissionTypeUI>; vital?: boolean},
>(data: T): Omit<T, 'permissions'> & {permissions: Array<YTPermissionType>} {
    let vital = data.vital;
    const effectivePermissions = data.permissions.map((item) => {
        if (item === REGISTER_QUEUE_CONSUMER_VITAL) {
            vital = true;
            return REGISTER_QUEUE_CONSUMER;
        }
        return item;
    });
    return {
        ...data,
        vital,
        permissions: effectivePermissions,
    };
}

export function convertFromUIPermission(permission: YTPermissionTypeUI): {
    permission: YTPermissionType;
    vital?: true;
} {
    if (permission === REGISTER_QUEUE_CONSUMER_VITAL) {
        return {permission: REGISTER_QUEUE_CONSUMER, vital: true};
    }
    return {permission};
}

export function isGranted(role: boolean | PreparedRole | undefined) {
    return 'boolean' === typeof role ? role : role?.state === 'granted';
}
