import concat_ from 'lodash/concat';
import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';

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
import type {Dispatch} from 'redux';
import type {Group} from '../../store/reducers/groups/table';
import type {OrderType} from '../../utils/sort-helpers';
import type {RootState} from '../../store/reducers';
import type {Subject} from '../../utils/acl/acl-types';

// Table

const GROUP_ATTRIBUTES = ['member_of', 'members', 'upravlyator_managed'];

export function fetchGroups() {
    return (dispatch: Dispatch) => {
        dispatch({type: GROUPS_TABLE.REQUEST});

        return listAllGroups(YTApiId.groupsData, {attributes: GROUP_ATTRIBUTES})
            .then((data) => {
                const groups: Group[] = [];
                forEach_(data, (item) => {
                    const {
                        $value: name,
                        $attributes: {members, member_of: memberOf = [], upravlyator_managed: idm},
                    } = item;
                    members.sort();
                    groups.push({
                        name,
                        members,
                        memberOf,
                        idm: flags.get(idm || false)!,
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

export function setGroupsNameFilter(nameFilter: string) {
    return {type: GROUPS_TABLE_DATA_FIELDS, data: {nameFilter}};
}

export function setGroupsPageSorting(column: string, order: OrderType) {
    return {
        type: GROUPS_TABLE_DATA_FIELDS,
        data: {sort: {column, order}},
    };
}

export function toggleGroupExpand(groupName: string) {
    return (dispatch: Dispatch, getState: () => RootState) => {
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

export function openGroupEditorModal(groupName: string) {
    return (dispatch: Dispatch, getState: () => RootState) => {
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
    groupName: string,
    usersToAdd: Subject[],
    usersToRemove: Subject[],
    responsiblesToAdd: Subject[],
    responsiblesToRemove: Subject[],
    comment: string,
) {
    return (_dispatch: Dispatch, getState: () => RootState) => {
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

function calculateMembers(
    members: Subject[],
    toAdd: Subject[],
    toRemove: Subject[],
): undefined | Subject[] {
    if ((!toAdd || !toAdd.length) && (!toRemove || !toRemove.length)) {
        return undefined;
    }

    const [rmUsers, rmGroups] = mapsByNameFromSubjects(toRemove);
    const afterRemove = filter_(members, (item) => {
        const {user, group} = item as {user: string; group: string};
        if (user) {
            return !rmUsers.has(user);
        } else {
            return !rmGroups.has(group);
        }
    });

    return concat_(afterRemove, toAdd);
}

function mapsByNameFromSubjects(subjects: Subject[]) {
    const userMap = new Map();
    const groupMap = new Map();
    forEach_(subjects, (item) => {
        const {user, group} = item as {user: string; group: string};
        if (user) {
            userMap.set(user, item);
        } else {
            groupMap.set(group, item);
        }
    });
    return [userMap, groupMap];
}
