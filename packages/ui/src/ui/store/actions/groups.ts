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
import {YTApiId, ytApiV3, ytApiV3Id} from '../../rum/rum-wrap-api';
import UIFactory from '../../UIFactory';
import type {Dispatch} from 'redux';
import type {Group} from '../../store/reducers/groups/table';
import type {OrderType} from '../../utils/sort-helpers';
import type {RootState} from '../../store/reducers';
import type {GroupSubject, Subject, UserSubject} from '../../utils/acl/acl-types';

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

export function openGroupEditorModal(groupName = '') {
    return (dispatch: Dispatch, getState: () => RootState) => {
        const state = getState();

        dispatch({
            type: GROUP_EDITOR_ACTION_DATA_FIELDS,
            data: {showModal: true, groupName},
        });

        if (!groupName) {
            return Promise.resolve();
        }

        dispatch({type: GROUP_EDITOR_ACTION.REQUEST});

        const path = `//sys/groups/${groupName}`;

        let idmDataPromise;

        const {getGroupAcl} = UIFactory.getAclApi();

        if (getGroupAcl) {
            idmDataPromise = getGroupAcl(getCluster(state), groupName);
        } else {
            idmDataPromise = Promise.resolve();
        }

        return Promise.all([
            ytApiV3Id.get(YTApiId.groupsEditData, {path, attributes: GROUP_ATTRIBUTES}),
            idmDataPromise,
        ])
            .then(([groupsData, idmData]) => {
                const data = {
                    data: groupsData,
                    ...(idmData ? {idmData} : {}),
                };

                return dispatch({
                    type: GROUP_EDITOR_ACTION.SUCCESS,
                    data,
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
        data: {groupData: undefined, groupName: '', showModal: false},
    };
}

export function createGroup({groupName}: {groupName: string}) {
    return ytApiV3.create({
        type: 'group',
        attributes: {name: groupName},
    });
}

export function deleteGroup({groupName}: {groupName: string}) {
    return ytApiV3.remove({
        path: '//sys/groups/' + groupName,
    });
}

type SaveGroupDataPayload = {
    initialGroupName: string;
    groupName: string;
    membersToAdd: Subject[];
    membersToRemove: Subject[];
    responsiblesToAdd: Subject[];
    responsiblesToRemove: Subject[];
    comment: string;
};

export function saveGroupData({
    initialGroupName,
    groupName,
    membersToAdd,
    membersToRemove,
    responsiblesToAdd,
    responsiblesToRemove,
    comment,
}: SaveGroupDataPayload) {
    return async (_dispatch: Dispatch, getState: () => RootState) => {
        const isNewGroup = !initialGroupName;

        if (isNewGroup) {
            await createGroup({groupName});
        }

        const groupNameChanged = initialGroupName !== groupName;

        if (!isNewGroup && groupNameChanged) {
            await renameGroup({
                oldGroupname: initialGroupName,
                newGroupName: groupName,
            });
        }

        const {updateGroup} = UIFactory.getAclApi();

        if (updateGroup) {
            const state = getState();
            const {members, responsible} = getGroupEditorSubjects(state);
            const version = getGroupEditorIdmDataVersion(state);
            const newMembers = calculateMembers(members, membersToAdd, membersToRemove);
            const newResponsibles = calculateMembers(
                responsible,
                responsiblesToAdd,
                responsiblesToRemove,
            );

            const cluster = getCluster(state);
            return updateGroup({
                cluster,
                groupName,
                version,
                groupDiff: {
                    members: newMembers,
                    responsible: newResponsibles,
                },
                comment,
            });
        }

        return changeGroupMembers({
            groupName,
            membersToAdd,
            membersToRemove,
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

type RenameGroupPayload = {
    oldGroupname: string;
    newGroupName: string;
};

function renameGroup({oldGroupname, newGroupName}: RenameGroupPayload) {
    return ytApiV3.set({path: `//sys/groups/${oldGroupname}/@name`}, newGroupName);
}

type ChangeGroupMembersPayload = {
    groupName: string;
    membersToAdd: Subject[];
    membersToRemove: Subject[];
};

function changeGroupMembers({groupName, membersToAdd, membersToRemove}: ChangeGroupMembersPayload) {
    const requestsToAdd = membersToAdd.map((user) => {
        return {
            command: 'add_member' as const,
            parameters: {
                group: groupName,
                member: (user as UserSubject).user || (user as GroupSubject).group,
            },
        };
    });

    const requestsToRemove = membersToRemove.map((user) => {
        return {
            command: 'remove_member' as const,
            parameters: {
                group: groupName,
                member: (user as UserSubject).user || (user as GroupSubject).group,
            },
        };
    });

    const requests = [...requestsToAdd, ...requestsToRemove];

    return ytApiV3.executeBatch({
        requests,
    });
}
