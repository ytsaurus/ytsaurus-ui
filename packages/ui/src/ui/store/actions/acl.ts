import {ThunkAction} from 'redux-thunk';
import _ from 'lodash';

import {
    DELETE_PERMISSION,
    IdmObjectType,
    LOAD_DATA,
    REQUEST_PERMISSION,
    UPDATE_ACL,
} from '../../constants/acl';
import {getPools, getTree} from '../../store/selectors/scheduling/scheduling';
import {computePathItems} from '../../utils/scheduling/scheduling';
import {
    YTPermissionTypeUI,
    checkUserPermissionsUI,
    getAcl,
    getResponsible,
} from '../../utils/acl/acl-api';
import {convertFromUIPermissions, prepareAclSubject} from '../../utils/acl';
import {ROOT_POOL_NAME} from '../../constants/scheduling';
import UIFactory from '../../UIFactory';
import {AclAction, HasIdmKind} from '../../store/reducers/acl/acl';
import {isCancelled} from '../../utils/cancel-helper';
import {RootState} from '../../store/reducers';
import {IdmKindType, PreparedAclSubject, ResponsibleType, Role} from '../../utils/acl/acl-types';
import {CheckPermissionResult} from '../../../shared/utils/check-permission';

type ThunkAclAction<T = unknown> = ThunkAction<T, RootState, unknown, AclAction>;

const prepareUserPermissions = (
    userPermissions: Array<CheckPermissionResult>,
    idmKind: IdmKindType,
) => {
    const {permissionTypes} = UIFactory.getAclPermissionsSettings()[idmKind];
    return _.map(userPermissions, (item, index) => {
        return {
            type: permissionTypes[index],
            action: item.action,
        };
    });
};

type HasNormPoolTree = {normalizedPoolTree?: string};

function getPathToCheckPermissions(
    idmKind: IdmKindType,
    state: RootState,
    entityName: string,
    poolTree?: string,
) {
    switch (idmKind) {
        case IdmObjectType.ACCESS_CONTROL_OBJECT:
        case IdmObjectType.UI_EFFECTIVE_ACL:
        case IdmObjectType.PATH:
            return entityName;
        case IdmObjectType.ACCOUNT:
            return `//sys/accounts/${entityName}`;
        case IdmObjectType.POOL: {
            const pools = getPools(state);
            if (pools?.length) {
                const poolPath = computePathItems(pools, entityName).filter(
                    (item) => item !== ROOT_POOL_NAME,
                );
                return `//sys/pool_trees/${poolTree}/${poolPath.join('/')}`;
            } else {
                const params = new URLSearchParams(window.location.search);
                const path = params.get('path');
                if (!path) {
                    break;
                }
                return path;
            }
        }
        case IdmObjectType.TABLET_CELL_BUNDLE: {
            return `//sys/tablet_cell_bundles/${entityName}`;
        }
    }
    throw new Error('Unexpected value of parameter idmKind');
}

export function loadAclData(
    {path, idmKind}: {path: string} & HasIdmKind,
    {normalizedPoolTree}: HasNormPoolTree = {},
    options: {userPermissionsPath?: string} = {userPermissionsPath: undefined},
): ThunkAclAction {
    return (dispatch, getState) => {
        const state = getState();
        const {login, cluster = ''} = state.global;

        dispatch({type: LOAD_DATA.REQUEST, idmKind});

        const poolTree =
            idmKind === IdmObjectType.POOL ? normalizedPoolTree || getTree(state) : undefined;
        const {permissionTypes} = UIFactory.getAclPermissionsSettings()[idmKind];

        const {userPermissionsPath} = options;

        const pathToCheckPermissions = getPathToCheckPermissions(idmKind, state, path, poolTree);
        const pathToCheckUserPermissions = userPermissionsPath
            ? getPathToCheckPermissions(idmKind, state, userPermissionsPath, poolTree)
            : pathToCheckPermissions;

        return Promise.all([
            getAcl({
                cluster,
                path,
                kind: idmKind,
                poolTree,
                sysPath: pathToCheckPermissions,
            }),
            checkUserPermissionsUI(pathToCheckUserPermissions, login, permissionTypes),
            getResponsible({
                cluster,
                path,
                kind: idmKind,
                poolTree,
                sysPath: pathToCheckPermissions,
            }),
        ])
            .then(([acl, userPermissions, responsible]) => {
                dispatch({
                    type: LOAD_DATA.SUCCESS,
                    data: {
                        path,
                        version: responsible.version,
                        auditors: responsible.auditors,
                        objectPermissions: acl.permissions,
                        columnGroups: acl.column_groups,
                        responsible: responsible.responsible,
                        userPermissions: prepareUserPermissions(userPermissions, idmKind),
                        readApprovers: responsible.readApprovers,
                        disableAclInheritance: responsible.disableAclInheritance,
                        bossApproval: responsible.bossApproval,
                        disableInheritanceResponsible: responsible.disableInheritanceResponsible,
                    },
                    idmKind,
                });
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_DATA.FAILURE,
                    data: {
                        error: error?.response?.data || error?.response || error,
                    },
                    idmKind,
                });
            });
    };
}

export function deletePermissions(
    {
        roleKey,
        idmKind,
        path,
        itemToDelete,
    }: HasIdmKind & {path: string; roleKey: string; itemToDelete: PreparedAclSubject},
    {normalizedPoolTree}: HasNormPoolTree = {},
): ThunkAclAction<Promise<void>> {
    return (dispatch, getState) => {
        const {cluster = ''} = getState().global;
        const state = getState();

        dispatch({
            type: DELETE_PERMISSION.REQUEST,
            data: roleKey,
            idmKind,
        });

        const poolTree =
            idmKind === IdmObjectType.POOL ? normalizedPoolTree || getTree(state) : undefined;

        const deletePermissionsPath = getPathToCheckPermissions(idmKind, state, path, poolTree);

        return UIFactory.getAclApi()
            .deleteRole({
                idmKind,
                cluster,
                roleKey,
                path,
                sysPath: deletePermissionsPath,
                itemToDelete,
            })
            .then(() => {
                dispatch({
                    type: DELETE_PERMISSION.SUCCESS,
                    data: roleKey,
                    idmKind,
                });
            })
            .catch((error) => {
                if (isCancelled(error)) {
                    dispatch({type: DELETE_PERMISSION.CANCELLED, idmKind});
                    return undefined;
                } else {
                    dispatch({
                        type: DELETE_PERMISSION.FAILURE,
                        data: error?.response?.data || error?.response || error,
                        idmKind,
                    });
                    return Promise.reject(error);
                }
            });
    };
}

function dateToDaysAfterNow(date?: Date) {
    if (!date) {
        return undefined;
    }

    return Math.round((date.getTime() - Date.now()) / 3600 / 24 / 1000);
}

export type PermissionToRequest = {
    path: string;
    cluster: string;
    permissions: {[x: string]: Array<YTPermissionTypeUI>} | null;
    subjects: Array<ResponsibleType>;
    inheritance_mode?: string;
    duration?: Date;
    comment?: string;
    permissionFlags?: Record<string, boolean>;
    readColumnGroup?: string;
    readColumns?: Array<string>;
};

export function requestPermissions(
    {values, idmKind}: {values: PermissionToRequest} & HasIdmKind,
    {normalizedPoolTree}: HasNormPoolTree = {},
): ThunkAclAction {
    return (dispatch, getState) => {
        const state = getState();
        const {
            global: {cluster = ''},
        } = state;

        dispatch({
            type: REQUEST_PERMISSION.REQUEST,
            idmKind,
        });

        const {requestPermissionsFlags = {}} = UIFactory.getAclApi();

        const daysAfter = dateToDaysAfterNow(values.duration);
        const roles: Array<Role> = [];
        const rolesGroupedBySubject = [];
        const {inheritance_mode, permissionFlags, readColumnGroup, readColumns} = values;
        for (const item of values.subjects) {
            const subject = prepareAclSubject(item);
            const commonPart = {
                subject,
                deprive_after_days: daysAfter,
                ...(inheritance_mode ? {inheritance_mode} : {}),
            };
            Object.entries(requestPermissionsFlags).forEach(([key, flagInfo]) => {
                flagInfo?.applyToRequestedRole(commonPart, permissionFlags?.[key]);
            });
            const flattenPermissions = _.flatten(_.map(values.permissions));
            if (flattenPermissions.length) {
                rolesGroupedBySubject.push({
                    permissions: flattenPermissions,
                    ...commonPart,
                });
            }
            if (readColumns?.length) {
                rolesGroupedBySubject.push({
                    ...rolesGroupedBySubject[rolesGroupedBySubject.length - 1],
                    ...commonPart,
                    columns: readColumns,
                    permissions: ['read' as const],
                });
            }
            _.forEach(values.permissions, (permissions) => {
                roles.push({
                    ...convertFromUIPermissions({permissions}),
                    ...commonPart,
                });
            });
            if (readColumnGroup) {
                roles.push({
                    role_type: 'column_read',
                    column_group_id: readColumnGroup,
                    ...commonPart,
                });
            }
        }

        const poolTree =
            idmKind === IdmObjectType.POOL ? normalizedPoolTree || getTree(state) : undefined;

        const requestPermissionsPath = getPathToCheckPermissions(
            idmKind,
            state,
            values.path,
            poolTree,
        );

        //cluster, path, roles, comment, columns
        return UIFactory.getAclApi()
            .requestPermissions({
                cluster,
                path: values.path,
                sysPath: requestPermissionsPath,
                roles,
                roles_grouped: rolesGroupedBySubject.map(convertFromUIPermissions),
                comment: values.comment ?? '',
                kind: idmKind,
                poolTree,
            })
            .then(() => {
                dispatch({
                    type: REQUEST_PERMISSION.SUCCESS,
                    idmKind,
                });
            })
            .catch((error) => {
                if (isCancelled(error)) {
                    dispatch({type: REQUEST_PERMISSION.CANCELLED, idmKind});
                    return undefined;
                } else {
                    dispatch({
                        type: REQUEST_PERMISSION.FAILURE,
                        data: error?.response?.data || error?.response || error,
                        idmKind,
                    });
                    return Promise.reject(error);
                }
            });
    };
}

export function cancelRequestPermissions({idmKind}: HasIdmKind) {
    return {type: REQUEST_PERMISSION.CANCELLED, idmKind};
}

export interface UpdateAclValues {
    responsible: Array<ResponsibleType>;
    auditors: Array<ResponsibleType>;
    readApprovers: Array<ResponsibleType>;
    disableInheritance: boolean;
    bossApproval: boolean;
    inheritAcl: boolean;
    comment: string;
}

export function updateAcl(
    {
        path,
        values,
        version,
        idmKind,
    }: {path: string; values: Partial<UpdateAclValues>; version?: string} & HasIdmKind,
    {normalizedPoolTree}: HasNormPoolTree = {},
): ThunkAclAction {
    return (dispatch, getState) => {
        const state = getState();
        const {
            global: {cluster = ''},
        } = getState();

        dispatch({
            type: UPDATE_ACL.REQUEST,
            idmKind,
        });

        const poolTree =
            idmKind === IdmObjectType.POOL ? normalizedPoolTree || getTree(state) : undefined;
        return UIFactory.getAclApi()
            .updateAcl(cluster, path, {
                ...values,
                version,
                idmKind,
                poolTree,
            })
            .then(() => {
                dispatch({
                    type: UPDATE_ACL.SUCCESS,
                    idmKind,
                });
            })
            .catch((error) => {
                if (isCancelled(error)) {
                    return dispatch({type: UPDATE_ACL.CANCELLED, idmKind});
                } else {
                    const data = error?.response?.data || error?.response || error;
                    dispatch({
                        type: UPDATE_ACL.FAILURE,
                        data,
                        idmKind,
                    });
                    return Promise.reject(error);
                }
            });
    };
}

export function cancelUpdateAcl({idmKind}: HasIdmKind): AclAction {
    return {type: UPDATE_ACL.CANCELLED, idmKind};
}
