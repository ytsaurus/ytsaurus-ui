import cloneDeep_ from 'lodash/cloneDeep';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import compact_ from 'lodash/compact';

import {createSelector} from 'reselect';
import {ROOT_GROUP_NAME} from '../../constants/groups';
import {compareWithUndefined, orderTypeToOrderK} from '../../utils/sort-helpers';

import {concatByAnd} from '../../common/hammer/predicate';
import hammer from '../../common/hammer';
import {FlagType, flags} from '../../utils';
import type {RootState} from '../../store/reducers';
import type {Group} from '../../store/reducers/groups/table';
import {isIdmAclAvailable} from '../../config';
import type {PreparedRole} from '../../utils/acl';

// Table

export const getGroupsTableDataState = (state: RootState) => state.groups.table;

const getGroups = (state: RootState) => state.groups.table.groups;
export const getGroupsNameFilter = (state: RootState) => state.groups.table.nameFilter;
export const getGroupsSort = (state: RootState) => state.groups.table.sort;
export const getGroupsExpanded = (state: RootState) => state.groups.table.expanded;

export type GroupsTreeNode = Group & {
    parent?: string;
    children: GroupsTreeNode[];
    leaves: GroupsTreeNode[];
    shift?: number;
    hasChildren?: boolean;
    expanded?: boolean;
};

type GroupsTree = Record<string, GroupsTreeNode>;

export const getGroupsTree = createSelector([getGroups], (groups) => {
    const res: GroupsTree = groups.reduce((acc: GroupsTree, item) => {
        acc[item.name] = {...item, children: [], leaves: []};
        return acc;
    }, {});
    const root = {children: [], leaves: [], name: ''};
    res[ROOT_GROUP_NAME] = root;

    const hasChildren: Record<string, boolean> = {};
    forEach_(res, (item: GroupsTreeNode) => {
        if (item === root) {
            return;
        }
        let {memberOf = []} = item;
        if (memberOf.length === 0) {
            memberOf = [ROOT_GROUP_NAME];
        }
        memberOf.forEach((parent) => {
            hasChildren[parent] = true;
            /**
             * Copy of the item is reuired because
             * a group might be a member of many other groups
             * i.e. different copies will have different parent field
             */
            const itemCopy = {...item, parent};
            res[parent].children.push(itemCopy);
            item.parent = parent;
        });
    });
    hammer.treeList.treeForEach(res[ROOT_GROUP_NAME], (item: GroupsTreeNode, depth: number) => {
        item.shift = depth - 1; // -1 cause <Root> is not visible
        item.hasChildren = hasChildren[item.name!];
    });
    return res;
});

const getGroupsTreeFiltered = createSelector(
    [getGroupsTree, getGroupsNameFilter],
    (tree, nameFilter) => {
        const root = tree[ROOT_GROUP_NAME];
        const predicates = compact_([
            nameFilter &&
                ((node: GroupsTreeNode) => {
                    return node === root || -1 !== node.name!.indexOf(nameFilter);
                }),
        ]);

        const res = hammer.treeList.filterTree(root, concatByAnd(...predicates));
        return res;
    },
);

const getGroupsTreeFilteredAndExpanded = createSelector(
    [getGroupsTreeFiltered, getGroupsExpanded, getGroupsNameFilter],
    (root, expanded, groupNameFilter) => {
        const res = cloneDeep_(root);
        hammer.treeList.treeForEach(res.children, (node: GroupsTreeNode) => {
            const {name} = node;
            if (!expanded[name] && !groupNameFilter) {
                node.children = [];
            }
        });
        return res;
    },
);

const GROUP_FIELDS = {
    name: {
        get(group: {name: string}) {
            return group.name;
        },
        compareFn: compareWithUndefined,
    },
    idm: {
        get(group: {idm: string}) {
            return group.idm;
        },
        compareFn: compareWithUndefined,
    },
    size: {
        get({members = []}: {members: string[]}) {
            return members.length;
        },
    },
};

const getGroupsTreeFilteredAndSorted = createSelector(
    [getGroupsTreeFilteredAndExpanded, getGroupsSort],
    (root, {column, order}) => {
        const {orderK, undefinedOrderK} = orderTypeToOrderK(order);
        const res = hammer.treeList.sortTree(
            {...root},
            {
                field: column,
                asc: orderK === 1,
                undefinedAsk: undefinedOrderK === 1,
            },
            GROUP_FIELDS,
        );
        return res;
    },
);

export const getGroupsFlattenTree = createSelector(
    [getGroupsTreeFilteredAndSorted],
    (root): GroupsTreeNode[] => {
        return hammer.treeList.flattenTree(root);
    },
);

// Editor
export const getGroupEditorData = (state: RootState) => state.groups.editor.data;
export const getGroupEditorVisible = (state: RootState) => state.groups.editor.showModal;
export const getGroupEditorGroupName = (state: RootState) => state.groups.editor.groupName;
// eslint-disable-next-line camelcase
export const getGroupEditorGroupIdm = (state: RootState) =>
    flags.get(state.groups.editor.data.$attributes?.upravlyator_managed as FlagType);
const getGroupEditorIdmData = (state: RootState) => state.groups.editor.idmData;
export const getGroupEditorIdmDataVersion = (state: RootState) =>
    state.groups.editor.idmData.version;
export const getGroupEditorIdmDataOtherMembers = (state: RootState) =>
    state.groups.editor.idmData.group.other_members;

export const getGroupEditorSubjects = createSelector([getGroupEditorIdmData], (idmData) => {
    const {
        group: {members, responsible},
    } = idmData;
    return {
        responsible: map_(responsible, ({subject}) => subject),
        members: map_(members, ({subject}) => subject),
    };
});

export const getGroupEditorRoles = createSelector(
    [getGroupEditorIdmData, getGroupEditorData],
    (
        idmData,
        data,
    ): {
        responsible: PreparedRole[];
        members: PreparedRole[];
    } => {
        if (isIdmAclAvailable()) {
            const {
                group: {members, responsible},
            } = idmData;

            return {
                responsible,
                members,
            };
        }

        const members = data.$attributes?.members || [];

        return {
            responsible: [],
            members: members.map((member) => {
                return {
                    text: member,
                    value: member,
                    state: 'granted',
                    role_type: 'member',
                    subject: {
                        user: member,
                    },
                };
            }),
        };
    },
);
