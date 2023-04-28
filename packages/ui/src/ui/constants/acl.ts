import createActionTypes, {createPrefix} from '../constants/utils';
import {IdmKindType} from '../utils/acl/acl-types';

const PREFIX = createPrefix('MANAGE_ACL');

export const LOAD_DATA = createActionTypes(PREFIX + 'LOAD_DATA');
export const DELETE_PERMISSION = createActionTypes(PREFIX + 'DELETE_PERMISSION');
export const REQUEST_PERMISSION = createActionTypes(PREFIX + 'REQUEST_PERMISSION');
export const UPDATE_ACL = createActionTypes(PREFIX + 'UPDATE_ACL');
export const ACL_CHANGE_FILTERS = `${PREFIX}ACL_CHANGE_FILTERS` as const;

export const IdmObjectType: {[key: string]: IdmKindType} = {
    ACCOUNT: 'account',
    PATH: 'path',
    POOL: 'pool',
    TABLET_CELL_BUNDLE: 'tablet_cell_bundle',
    ACCESS_CONTROL_OBJECT: 'access_control_object',
};

const PERMISSION_TYPES = [
    'read',
    'write',
    'remove',
    'administer',
    'manage',
    'mount',
    'use',
    'create',
];

const ACCOUNTS_PERMISSION_TYPES = ['administer', 'use'];

export const PERMISSIONS_SETTINGS = {
    [IdmObjectType.PATH]: {
        permissionTypes: PERMISSION_TYPES,
        permissionsToRequest: [['read'], ['read', 'write', 'remove'], ['mount']],
        allowBossApprovals: true,
        allowReadApprovers: true,
        allowAuditors: true,
        allowInheritAcl: true,
        allowInheritResponsibles: true,
    },
    [IdmObjectType.ACCESS_CONTROL_OBJECT]: {
        permissionTypes: PERMISSION_TYPES,
        permissionsToRequest: [['read'], ['read', 'write', 'remove'], ['mount']],
        allowBossApprovals: true,
        allowReadApprovers: true,
        allowAuditors: true,
        allowInheritAcl: true,
        allowInheritResponsibles: true,
    },
    [IdmObjectType.ACCOUNT]: {
        permissionTypes: ACCOUNTS_PERMISSION_TYPES,
        permissionsToRequest: [['use']],
        allowBossApprovals: false,
        allowReadApprovers: false,
        allowAuditors: false,
        allowInheritAcl: false,
        allowInheritResponsibles: true,
    },
    [IdmObjectType.POOL]: {
        permissionTypes: ACCOUNTS_PERMISSION_TYPES,
        permissionsToRequest: [['use']],
        allowBossApprovals: false,
        allowReadApprovers: false,
        allowAuditors: false,
        allowInheritAcl: true,
        allowInheritResponsibles: true,
    },
    [IdmObjectType.TABLET_CELL_BUNDLE]: {
        permissionTypes: ACCOUNTS_PERMISSION_TYPES,
        permissionsToRequest: [['use']],
        allowBossApprovals: false,
        allowReadApprovers: false,
        allowAuditors: false,
        allowInheritAcl: false,
        allowInheritResponsibles: false,
    },
};
