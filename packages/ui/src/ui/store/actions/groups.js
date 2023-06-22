import _ from 'lodash';

import {
    GROUPS_TABLE,
    GROUPS_TABLE_DATA_FIELDS,
    GROUP_EDITOR_ACTION,
    GROUP_EDITOR_ACTION_DATA_FIELDS,
} from '../../constants/groups';
import {getCluster} from '../../store/selectors/global';
import {
    getGroupEditorIdmDataVersion,
    getGroupEditorSubjects,
    getGroupsExpanded,
} from '../../store/selectors/groups';
import {flags} from '../../utils/index';
import {listAllGroups} from '../../utils/users-groups';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import UIFactory from '../../UIFactory';

// Table

const GROUP_ATTRIBUTES = ['member_of', 'members', 'upravlyator_managed'];

export function fetchGroups() {
    return (dispatch) => {
        dispatch({type: GROUPS_TABLE.REQUEST});

        return listAllGroups(YTApiId.groupsData, {attributes: GROUP_ATTRIBUTES})
            .then((data) => {
                const groups = [];
                _.forEach(data, (item) => {
                    const {
                        $value: name,
                        $attributes: {members, member_of: memberOf = [], upravlyator_managed: idm},
                    } = item;
                    members.sort();
                    groups.push({
                        name,
                        members,
                        memberOf,
                        idm: flags.get(idm || false),
                    });
                });
                return dispatch({
                    type: GROUPS_TABLE.SUCCESS,
                    data: {groups},
                });
            })
            .catch((error) => {
                dispatch({type: GROUPS_TABLE.FAILURE, data: {error}});
            });
    };
}

export function setGroupsNameFilter(nameFilter) {
    return {type: GROUPS_TABLE_DATA_FIELDS, data: {nameFilter}};
}

export function setGroupsPageSorting(column, order) {
    return {
        type: GROUPS_TABLE_DATA_FIELDS,
        data: {sort: {column, order}},
    };
}

export function toggleGroupExpand(groupName) {
    return (dispatch, getState) => {
        const expanded = {...getGroupsExpanded(getState())};
        const current = expanded[groupName];
        if (current) {
            delete expanded[groupName];
        } else {
            expanded[groupName] = true;
        }

        return dispatch({type: GROUPS_TABLE_DATA_FIELDS, data: {expanded}});
    };
}

export function openGroupEditorModal(groupName) {
    return (dispatch, getState) => {
        const state = getState();

        dispatch({
            type: GROUP_EDITOR_ACTION_DATA_FIELDS,
            data: {showModal: true, groupName},
        });
        dispatch({type: GROUP_EDITOR_ACTION.REQUEST});

        const path = `//sys/groups/${groupName}`;
        return Promise.all([
            ytApiV3Id.get(YTApiId.groupsEditData, {path, attributes: GROUP_ATTRIBUTES}),
            UIFactory.getAclApi().getGroupAcl(getCluster(state), groupName),
        ])
            .then(([data, idmData]) => {
                return dispatch({
                    type: GROUP_EDITOR_ACTION.SUCCESS,
                    data: {data, idmData},
                });
            })
            .catch((error) => {
                return dispatch({
                    type: GROUP_EDITOR_ACTION.FAILURE,
                    data: error,
                });
            });
    };
}

export function closeGroupEditorModal() {
    return {
        type: GROUP_EDITOR_ACTION_DATA_FIELDS,
        data: {groupData: undefined, groupName: ''},
    };
}

export function saveGroupData(
    groupName,
    usersToAdd,
    usersToRemove,
    responsiblesToAdd,
    responsiblesToRemove,
    comment,
) {
    return (dispatch, getState) => {
        const state = getState();
        const {members, responsible} = getGroupEditorSubjects(state);
        const version = getGroupEditorIdmDataVersion(state);
        const newMembers = calculateMembers(members, usersToAdd, usersToRemove);
        const newResponsibles = calculateMembers(
            responsible,
            responsiblesToAdd,
            responsiblesToRemove,
        );

        const cluster = getCluster(state);
        return UIFactory.getAclApi().updateGroup({
            cluster,
            groupName,
            version,
            groupDiff: {
                members: newMembers,
                responsible: newResponsibles,
            },
            comment,
        });
    };
}

function calculateMembers(members, toAdd, toRemove) {
    if ((!toAdd || !toAdd.length) && (!toRemove || !toRemove.length)) {
        return undefined;
    }

    const [rmUsers, rmGroups] = mapsByNameFromSubjects(toRemove);
    const afterRemove = _.filter(members, ({user, group}) => {
        if (user) {
            return !rmUsers.has(user);
        } else {
            return !rmGroups.has(group);
        }
    });

    return _.concat(afterRemove, toAdd);
}

function mapsByNameFromSubjects(subjects) {
    const userMap = new Map();
    const groupMap = new Map();
    _.forEach(subjects, (item) => {
        const {user, group} = item;
        if (user) {
            userMap.set(user, item);
        } else {
            groupMap.set(group, item);
        }
    });
    return [userMap, groupMap];
}
