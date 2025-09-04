import difference_ from 'lodash/difference';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';

import {getBatchError} from '../../../shared/utils/error';

import {
    USERS_EDIT_USER,
    USERS_EDIT_USER_DATA_FIELDS,
    USERS_TABLE,
    USERS_TABLE_DATA_FIELDS,
} from '../../constants/users';
import {getCluster} from '../../store/selectors/global';
import {listAllUsers} from '../../utils/users-groups';
import {flags} from '../../utils/index';
import {YTApiId, ytApiV3Id, ytApiV4Id} from '../../rum/rum-wrap-api';
import UIFactory from '../../UIFactory';
import {sha256} from '../../utils/sha256';
import {getExternalSystem} from '../../utils/getExternalSystem';

const USER_ATTRIBUTES = [
    'name',
    'banned',
    'ban_message',
    'member_of',
    'member_of_closure',
    'read_request_rate_limit',
    'request_queue_size_limit',
    'write_request_rate_limit',
    'upravlyator_managed',
    'ldap',
];

export function prepareUserData(item) {
    const {
        $attributes: {
            member_of: groups,
            member_of_closure: allGroups,
            upravlyator_managed: idm,
            ldap,
        },
    } = item;
    groups.sort();
    allGroups.sort();
    const hasIdm = flags.get(idm || false);

    item.$attributes.idm = hasIdm;
    item.$attributes.externalSystem = getExternalSystem(ldap, hasIdm);
    item.$attributes['transitiveGroups'] = difference_(allGroups, groups);
    return item.$attributes;
}

export function fetchUsers() {
    return (dispatch) => {
        dispatch({type: USERS_TABLE.REQUEST});

        return listAllUsers(YTApiId.usersData, {attributes: USER_ATTRIBUTES})
            .then((data) => {
                const users = [];
                forEach_(data, (item) => {
                    users.push(prepareUserData(item));
                });
                dispatch({type: USERS_TABLE.SUCCESS, data: {users}});
            })
            .catch((error) => {
                dispatch({type: USERS_TABLE.FAILURE, data: error});
            });
    };
}

export function setUsersNameFilter(nameFilter) {
    return {type: USERS_TABLE_DATA_FIELDS, data: {nameFilter}};
}

export function setUsersGroupFilter(filter) {
    return {
        type: USERS_TABLE_DATA_FIELDS,
        data: {groupFilter: filter || ''},
    };
}

export function setUsersBannedFilter(bannedFilter) {
    return {type: USERS_TABLE_DATA_FIELDS, data: {bannedFilter}};
}

export function setUsersPageSorting({column, order}) {
    const sort = {column, order};
    if (!order) {
        sort.column = '';
    }
    return {type: USERS_TABLE_DATA_FIELDS, data: {sort}};
}

export function showUserEditorModal(username) {
    return (dispatch) => {
        const isNewUser = !username;

        if (isNewUser) {
            dispatch({
                type: USERS_EDIT_USER_DATA_FIELDS,
                data: {showModal: true},
            });
            return;
        }

        dispatch({type: USERS_EDIT_USER.REQUEST});
        const path = `//sys/users/${username}`;
        return ytApiV3Id
            .get(YTApiId.usersEditData, {path, attributes: USER_ATTRIBUTES})
            .then((res) => {
                dispatch({
                    type: USERS_EDIT_USER.SUCCESS,
                    data: {data: prepareUserData(res)},
                });
                dispatch({
                    type: USERS_EDIT_USER_DATA_FIELDS,
                    data: {showModal: true, username},
                });
            })
            .catch((error) => {
                return dispatch({type: USERS_EDIT_USER.FAILURE, data: error});
            });
    };
}

export function closeUserEditorModal() {
    return {
        type: USERS_EDIT_USER_DATA_FIELDS,
        data: {showModal: false, username: ''},
    };
}

function removeUserFromGroups(cluster, username, groups) {
    return Promise.all(
        map_(groups, (groupname) => {
            return UIFactory.getAclApi().removeUserFromGroup({cluster, username, groupname});
        }),
    );
}

function addUserToGroups(cluster, username, groups, comment) {
    return Promise.all(
        map_(groups, (groupname) => {
            return UIFactory.getAclApi().addUserToGroup({cluster, username, groupname, comment});
        }),
    );
}

function changeUserPassword({username, password}) {
    if (password) {
        return sha256(password).then((new_password_sha256) => {
            return ytApiV4Id.setUserPassword(YTApiId.setUserPassword, {
                parameters: {
                    user: username,
                    new_password_sha256,
                },
            });
        });
    }

    return Promise.resolve();
}

export function saveUserData({
    username,
    newName,
    attributes,
    groupsToAdd,
    groupsToRemove,
    password,
}) {
    return (dispatch, getState) => {
        dispatch({type: USERS_EDIT_USER.REQUEST});

        const path = `//sys/users/${username}`;
        const requests = [];
        const {comment, ...restAttrs} = attributes;
        forEach_(restAttrs, (value, key) => {
            requests.push({
                command: 'set',
                parameters: {
                    path: `${path}/@${key}`,
                },
                input: value,
            });
        });

        if (newName !== username) {
            requests.push({
                command: 'set',
                parameters: {
                    path: `${path}/@name`,
                },
                input: newName,
            });
        }

        const state = getState();
        const cluster = getCluster(state);

        return (
            Promise.all(
                [
                    addUserToGroups(cluster, username, groupsToAdd, comment),
                    removeUserFromGroups(cluster, username, groupsToRemove),
                    changeUserPassword({username, password}),
                    requests.length && ytApiV3Id.executeBatch(YTApiId.usersSaveData, {requests}),
                ].filter(Boolean),
            )
                // eslint-disable-next-line no-unused-vars
                .then(([addRes, removeRes, changePasswordRes, batchRes]) => {
                    const batchError = getBatchError(batchRes, "Failed to save user's data");
                    if (batchError) {
                        throw batchError;
                    }

                    dispatch({type: USERS_EDIT_USER.SUCCESS, data: {}});
                    dispatch(fetchUsers());

                    return;
                })
                .catch((error) => {
                    const data = error?.response?.data || error;
                    dispatch({type: USERS_EDIT_USER.FAILURE, data: data});
                    return Promise.reject(data);
                })
        );
    };
}
