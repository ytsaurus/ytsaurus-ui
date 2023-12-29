import _ from 'lodash';
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {
    DELETE_PERMISSION,
    IdmObjectType,
    LOAD_DATA,
    REQUEST_PERMISSION,
    UPDATE_ACL,
} from '../../constants/acl';
import {getPools, getTree} from '../../store/selectors/scheduling/scheduling';
import {computePathItems} from '../../utils/scheduling/scheduling';
import {checkUserPermissions, getAcl, getResponsible} from '../../utils/acl/acl-api';
import {prepareAclSubject} from '../../utils/acl';
import {ROOT_POOL_NAME} from '../../constants/scheduling';
import UIFactory from '../../UIFactory';

const prepareUserPermissions = (userPermissions, idmKind) => {
    const {permissionTypes} = UIFactory.getAclPermissionsSettings()[idmKind];
    return _.map(userPermissions, (item, index) => {
        return {
            type: permissionTypes[index],
            action: item.action,
        };
    });
};

function getPathToCheckPermissions(idmKind, state, entityName, poolTree) {
    switch (idmKind) {
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
        case IdmObjectType.ACCESS_CONTROL_OBJECT: {
            return entityName;
        }
        default:
            throw new Error('Unexpected value of parameter idmKind');
    }
}

export function loadAclData(
    {path, idmKind, aclType},
    {normalizedPoolTree} = {},
    options = {useEffective: false, skipResponsible: false, userPermissionsPath: undefined},
) {
    return (dispatch, getState) => {
        const state = getState();
        const {login, cluster} = state.global;

        dispatch({type: LOAD_DATA.REQUEST, idmKind});

        const poolTree =
            idmKind === IdmObjectType.POOL ? normalizedPoolTree || getTree(state) : undefined;
        const {permissionTypes} = UIFactory.getAclPermissionsSettings()[idmKind];

        const {useEffective, skipResponsible, userPermissionsPath} = options;

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
                useEffective,
                aclType,
            }),
            checkUserPermissions(pathToCheckUserPermissions, login, permissionTypes),
            getResponsible({
                cluster,
                path,
                kind: idmKind,
                poolTree,
                sysPath: pathToCheckPermissions,
                skipResponsible,
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
    {roleKey, idmKind, path, itemToDelete, aclType},
    {normalizedPoolTree} = {},
) {
    return (dispatch, getState) => {
        const {cluster} = getState().global;
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
                aclType,
            })
            .then(() => {
                dispatch({
                    type: DELETE_PERMISSION.SUCCESS,
                    data: roleKey,
                    idmKind,
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: DELETE_PERMISSION.CANCELLED, idmKind});
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

function dateToDaysAfterNow(date) {
    if (!date) {
        return undefined;
    }

    return Math.round((date.getTime() - Date.now()) / 3600 / 24 / 1000);
}

export function requestPermissions({values, idmKind, aclType}, {normalizedPoolTree} = {}) {
    return (dispatch, getState) => {
        const state = getState();
        const {
            global: {cluster},
        } = state;

        dispatch({
            type: REQUEST_PERMISSION.REQUEST,
            idmKind,
        });

        const daysAfter = dateToDaysAfterNow(values.duration);
        const roles = [];
        const rolesGroupedBySubject = [];
        const {inheritance_mode} = values;
        for (const item of values.subjects) {
            const subject = item.type === 'app' ? {tvm_id: item.value} : prepareAclSubject(item);
            rolesGroupedBySubject.push({
                permissions: _.flatten(_.map(values.permissions)),
                subject,
                deprive_after_days: daysAfter,
                ...(inheritance_mode ? {inheritance_mode} : {}),
            });
            _.forEach(values.permissions, (permissions) => {
                roles.push({
                    permissions,
                    subject,
                    deprive_after_days: daysAfter,
                    ...(inheritance_mode ? {inheritance_mode} : {}),
                });
            });
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
                roles_grouped: rolesGroupedBySubject,
                comment: values.comment,
                kind: idmKind,
                poolTree,
                aclType,
            })
            .then(() => {
                dispatch({
                    type: REQUEST_PERMISSION.SUCCESS,
                    idmKind,
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: REQUEST_PERMISSION.CANCELLED, idmKind});
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

export function cancelRequestPermissions({idmKind}) {
    return {type: REQUEST_PERMISSION.CANCELLED, idmKind};
}

export function updateAcl({path, values, version, idmKind}, {normalizedPoolTree} = {}) {
    return (dispatch, getState) => {
        const state = getState();
        const {
            global: {cluster},
        } = getState();

        dispatch({
            type: UPDATE_ACL.REQUEST,
            idmKind,
        });

        const poolTree =
            idmKind === IdmObjectType.POOL ? normalizedPoolTree || getTree(state) : undefined;
        return UIFactory.getAclApi()
            .updateAcl(cluster, path, {
                responsible: values.responsibleApproval,
                auditors: values.auditors,
                disableInheritance: !values.inheritanceResponsible,
                bossApproval: values.bossApproval,
                inheritAcl: values.inheritAcl,
                readApprovers: values.readApprovers,
                version,
                idmKind,
                poolTree,
                comment: values.comment,
            })
            .then(() => {
                dispatch({
                    type: UPDATE_ACL.SUCCESS,
                    idmKind,
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
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

export function cancelUpdateAcl({idmKind}) {
    return {type: UPDATE_ACL.CANCELLED, idmKind};
}
