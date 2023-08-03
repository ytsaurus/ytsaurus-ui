import {YTPermissionType} from '../../../shared/yt-types';
import {
    IdmObjectType,
    REGISTER_QUEUE_CONSUMER,
    REGISTER_QUEUE_CONSUMER_VITAL,
} from '../../constants/acl';
import {IdmKindType, ResponsibleType, Subject} from '../../utils/acl/acl-types';

// //sys/accounts/accountName
const ACCOUNTS_REGEXP = new RegExp('//sys/accounts/.+');

// //sys/pool_trees/pool_tree/.../pool_name
const POOL_TREES_REGEXP = new RegExp('//sys/pool_trees/[^/]+/.+');

// //sys/tablet_cell_bundles/bundleName
const TCB_REGEXP = new RegExp('//sys/tablet_cell_bundles/.+');

// //sys/access_control_object_namespaces/namespace/name
const ACCESS_CONTROL_OBJECT_REGEXP = new RegExp(
    '//sys/access_control_object_namespaces/[^/]+/[^/]+$',
);

// //sys/access_control_object_namespaces...
const ACCESS_CONTROL_OBJECT_ANY_REGEXP = new RegExp(
    '//sys/access_control_object_namespaces[^/+]{0,}',
);

interface NormalizedIdmParams {
    idmKind: IdmKindType;
    path: string;
    pool_tree?: string;
    useEffective?: boolean;
    skipResponsible?: boolean;
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
        } else if (ACCESS_CONTROL_OBJECT_ANY_REGEXP.test(path)) {
            res = {
                idmKind: idmKind,
                path: path,
                useEffective: true,
                skipResponsible: true,
            };
        }
    }

    if (idmKind === IdmObjectType.ACCESS_CONTROL_OBJECT) {
        if (ACCESS_CONTROL_OBJECT_REGEXP.test(path)) {
            res = {
                idmKind: idmKind,
                path: path,
                userPermissionsPath: `${path}/principal`,
                skipResponsible: true,
            };
        } else {
            res = {
                idmKind: IdmObjectType.PATH,
                path: path,
            };
        }
    }

    return res;
}

export interface PreparedRole {
    type?: 'users' | 'groups';
    subject: Subject;
    subjectUrl?: string;
    inherited?: boolean;
    idmLink?: string;
    key?: string;
    group?: 'role' | number;
    value?: string | number;
    text?: string;
    isDepriving?: boolean;
    isRequested?: boolean;
    isApproved?: boolean;
    isUnrecognized?: boolean;
    isMissing?: boolean;

    group_name?: string;
    user?: string;
    name?: string;
    tvm_id?: string;

    state?: string;
    role_type?: string;
    permissions?: Array<string>;
    inheritance_mode?: string;
    columns?: Array<string>;
    member?: boolean;
    deprive_date?: string;
}

export function prepareAclSubject({type, value}: ResponsibleType) {
    return {[type === 'users' ? 'user' : 'group']: value};
}

export function convertToUIPermissions<T extends {permissions?: Array<string>; vital?: boolean}>(
    role: T,
): T {
    if (!role.vital ?? !role.permissions) {
        return role;
    }

    const uiPermissions: T['permissions'] = role.permissions.map((item) => {
        return item === REGISTER_QUEUE_CONSUMER ? REGISTER_QUEUE_CONSUMER_VITAL : item;
    });
    return {
        ...role,
        permissions: uiPermissions,
    };
}

export function convertFromUIPermissions<T extends {permissions: Array<string>; vital?: boolean}>(
    data: T,
): T {
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

export function convertFromUIPermission(
    permission: YTPermissionType | typeof REGISTER_QUEUE_CONSUMER_VITAL,
): {permission: YTPermissionType; vital?: true} {
    if (permission === REGISTER_QUEUE_CONSUMER_VITAL) {
        return {permission: REGISTER_QUEUE_CONSUMER, vital: true};
    }
    return {permission};
}
