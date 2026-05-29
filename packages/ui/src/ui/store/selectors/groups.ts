import cloneDeep_ from 'lodash/cloneDeep';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import compact_ from 'lodash/compact';

import {createSelector} from 'reselect';
import {ROOT_GROUP_NAME} from '../../constants/groups';
import {compareWithUndefined, orderTypeToOrderK} from '../../utils/sort-helpers';

import {concatByAnd} from '../../common/hammer/predicate';
import hammer from '../../common/hammer';
import {type FlagType, flags} from '../../utils';
import {type RootState} from '../../store/reducers';
import {type Group} from '../../store/reducers/groups/table';
import {isIdmAclAvailable} from '../../config';
import {type PreparedRole} from '../../utils/acl';

// Table

export const selectGroupsTableDataState = (state: RootState) => state.groups.table;

const selectGroups = (state: RootState) => state.groups.table.groups;
export const selectGroupsNameFilter = (state: RootState) => state.groups.table.nameFilter;
export const selectGroupsSort = (state: RootState) => state.groups.table.sort;
export const selectGroupsExpanded = (state: RootState) => state.groups.table.expanded;

export type GroupsTreeNode = Group & {
    parent?: string;
    children: GroupsTreeNode[];
    leaves: GroupsTreeNode[];
    shift?: number;
    hasChildren?: boolean;
    expanded?: boolean;
};

type GroupsTree = Record<string, GroupsTreeNode>;

export const selectGroupsTree = createSelector([selectGroups], (groups) => {
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

const selectGroupsTreeFiltered = createSelector(
    [selectGroupsTree, selectGroupsNameFilter],
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

const selectGroupsTreeFilteredAndExpanded = createSelector(
    [selectGroupsTree, selectGroupsTreeFiltered, selectGroupsExpanded, selectGroupsNameFilter],
    (groupTree, groupsTreeFiltered, expandedByUser, groupNameFilter) => {
        const expandedBySearch: Record<string, boolean> = {};

        const res = cloneDeep_(groupsTreeFiltered);

        hammer.treeList.treeForEach(res.children, (node: GroupsTreeNode) => {
            const isNodeMatchedFilter = groupNameFilter && node.name.includes(groupNameFilter);

            if (isNodeMatchedFilter) {
                let parentName = node.parent!;

                while (groupTree[parentName]) {
                    expandedBySearch[parentName] = true;
                    parentName = groupTree[parentName].parent!;
                }
            }
        });

        hammer.treeList.treeForEach(res.children, (node: GroupsTreeNode) => {
            const userInteractedWithNode = typeof expandedByUser[node.name] !== 'undefined';

            const expanded = userInteractedWithNode ? expandedByUser : expandedBySearch;

            if (!expanded[node.name]) {
                node.expanded = false;
                node.children = [];
            } else {
                node.expanded = true;
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

const selectGroupsTreeFilteredAndSorted = createSelector(
    [selectGroupsTreeFilteredAndExpanded, selectGroupsSort],
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

export const selectGroupsFlattenTree = createSelector(
    [selectGroupsTreeFilteredAndSorted],
    (root): GroupsTreeNode[] => {
        return hammer.treeList.flattenTree(root);
    },
);

// Editor
export const selectGroupEditorData = (state: RootState) => state.groups.editor.data;
export const selectGroupEditorVisible = (state: RootState) => state.groups.editor.showModal;
export const selectGroupEditorGroupName = (state: RootState) => state.groups.editor.groupName;
// eslint-disable-next-line camelcase
export const selectGroupEditorGroupIdm = (state: RootState) =>
    flags.get(state.groups.editor.data.$attributes?.upravlyator_managed as FlagType);
const selectGroupEditorIdmData = (state: RootState) => state.groups.editor.idmData;
export const selectGroupEditorIdmDataVersion = (state: RootState) =>
    state.groups.editor.idmData.version;
export const selectGroupEditorIdmDataOtherMembers = (state: RootState) =>
    state.groups.editor.idmData.group.other_members;

export const selectGroupEditorSubjects = createSelector([selectGroupEditorIdmData], (idmData) => {
    const {
        group: {members, responsible},
    } = idmData;
    return {
        responsible: map_(responsible, ({subject}) => subject),
        members: map_(members, ({subject}) => subject),
    };
});

export const selectGroupEditorRoles = createSelector(
    [selectGroupEditorIdmData, selectGroupEditorData],
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
