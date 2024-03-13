import {YTPermissionTypeUI} from '../utils/acl/acl-api';
import createActionTypes, {createPrefix} from '../constants/utils';
import {IdmKindType} from '../utils/acl/acl-types';

const PREFIX = createPrefix('MANAGE_ACL');

export const LOAD_DATA = createActionTypes(`${PREFIX}LOAD_DATA`);
export const DELETE_PERMISSION = createActionTypes(`${PREFIX}DELETE_PERMISSION`);
export const REQUEST_PERMISSION = createActionTypes(`${PREFIX}REQUEST_PERMISSION`);
export const UPDATE_ACL = createActionTypes(`${PREFIX}UPDATE_ACL`);
export const ACL_CHANGE_FILTERS = `${PREFIX}ACL_CHANGE_FILTERS` as const;

export const IdmObjectType = {
    ACCOUNT: 'account',
    PATH: 'path',
    POOL: 'pool',
    TABLET_CELL_BUNDLE: 'tablet_cell_bundle',
    ACCESS_CONTROL_OBJECT: 'access_control_object',
    UI_EFFECTIVE_ACL: 'ui_effective_acl',
} as const;

export const REGISTER_QUEUE_CONSUMER = 'register_queue_consumer';
export const REGISTER_QUEUE_CONSUMER_VITAL = 'register_queue_consumer_vital';

const PERMISSION_TYPES: Array<YTPermissionTypeUI> = [
    'read',
    'write',
    'remove',
    'administer',
    'manage',
    'mount',
    'use',
    'create',
    REGISTER_QUEUE_CONSUMER,
    REGISTER_QUEUE_CONSUMER_VITAL,
];

export const INHERITANCE_MODE_TYPES = {
    OBJECT_ONLY: 'object_only',
    OBJECT_AND_DESCENDANTS: 'object_and_descendants',
    DESCENDANTS_ONLY: 'descendants_only',
    IMMEDIATE_DESCENDANTS_ONLY: 'immediate_descendants_only',
};

const ACCOUNTS_PERMISSION_TYPES = ['administer' as const, 'use' as const];

const PATH_SETTINGS = {
    permissionTypes: PERMISSION_TYPES,
    permissionsToRequest: [
        ['read' as const],
        ['write' as const],
        ['remove' as const],
        ['mount' as const],
    ],
    allowBossApprovals: true,
    allowReadApprovers: true,
    allowAuditors: true,
    allowInheritAcl: true,
    allowInheritResponsibles: true,
    allowDeleteWithoutRevisionCheck: false,
};

export type PermissionSettings = {
    permissionTypes: Array<YTPermissionTypeUI>;
    permissionsToRequest: Array<Array<YTPermissionTypeUI>>;
    allowBossApprovals: boolean;
    allowReadApprovers: boolean;
    allowAuditors: boolean;
    allowInheritAcl: boolean;
    allowInheritResponsibles: boolean;
    allowDeleteWithoutRevisionCheck?: boolean;
    skipResponsible?: boolean;
};

export const PERMISSIONS_SETTINGS: Record<IdmKindType, PermissionSettings> = {
    [IdmObjectType.UI_EFFECTIVE_ACL]: {...PATH_SETTINGS, permissionsToRequest: []},
    [IdmObjectType.PATH]: PATH_SETTINGS,
    [IdmObjectType.ACCESS_CONTROL_OBJECT]: {
        permissionTypes: PERMISSION_TYPES,
        permissionsToRequest: [
            ['read'],
            ['write'],
            ['use'],
            ['administer'],
            ['create'],
            ['remove'],
            ['mount'],
            ['manage'],
        ],
        allowBossApprovals: true,
        allowReadApprovers: true,
        allowAuditors: true,
        allowInheritAcl: true,
        allowInheritResponsibles: true,
        allowDeleteWithoutRevisionCheck: true,
        skipResponsible: true,
    },
    [IdmObjectType.ACCOUNT]: {
        permissionTypes: ACCOUNTS_PERMISSION_TYPES,
        permissionsToRequest: [['use']],
        allowBossApprovals: false,
        allowReadApprovers: false,
        allowAuditors: false,
        allowInheritAcl: false,
        allowInheritResponsibles: true,
        allowDeleteWithoutRevisionCheck: true,
    },
    [IdmObjectType.POOL]: {
        permissionTypes: ACCOUNTS_PERMISSION_TYPES,
        permissionsToRequest: [['use']],
        allowBossApprovals: false,
        allowReadApprovers: false,
        allowAuditors: false,
        allowInheritAcl: true,
        allowInheritResponsibles: true,
        allowDeleteWithoutRevisionCheck: true,
    },
    [IdmObjectType.TABLET_CELL_BUNDLE]: {
        permissionTypes: ACCOUNTS_PERMISSION_TYPES,
        permissionsToRequest: [['use']],
        allowBossApprovals: false,
        allowReadApprovers: false,
        allowAuditors: false,
        allowInheritAcl: false,
        allowInheritResponsibles: false,
        allowDeleteWithoutRevisionCheck: true,
    },
};
