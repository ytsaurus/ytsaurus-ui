import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import {createSelector} from 'reselect';
import {ROOT_GROUP_NAME} from '../../constants/groups';
import forEach from 'lodash/forEach';
import {compareWithUndefined, orderTypeToOrderK} from '../../utils/sort-helpers';

import {concatByAnd} from '../../common/hammer/predicate';
import hammer from '../../common/hammer';
import {flags} from '../../utils';

// Table

export const getGroupsTableDataState = (state) => state.groups.table;

const getGroups = (state) => state.groups.table.groups;
export const getGroupsNameFilter = (state) => state.groups.table.nameFilter;
export const getGroupsSort = (state) => state.groups.table.sort;
export const getGroupsExpanded = (state) => state.groups.table.expanded;

export const getGroupsTree = createSelector([getGroups], (groups) => {
    const res = groups.reduce((acc, item) => {
        acc[item.name] = {...item, children: [], leaves: []};
        return acc;
    }, {});
    const root = {children: [], leaves: []};
    res[ROOT_GROUP_NAME] = root;

    const hasChildren = {};
    forEach(res, (item) => {
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
    hammer.treeList.treeForEach(res[ROOT_GROUP_NAME], (item, depth) => {
        item.shift = depth - 1; // -1 cause <Root> is not visible
        item.hasChildren = hasChildren[item.name];
    });
    return res;
});

const getGroupsTreeFiltered = createSelector(
    [getGroupsTree, getGroupsNameFilter],
    (tree, nameFilter) => {
        const root = tree[ROOT_GROUP_NAME];
        const predicates = [
            nameFilter &&
                ((node) => {
                    return node === root || -1 !== node.name.indexOf(nameFilter);
                }),
        ].filter(Boolean);

        const res = hammer.treeList.filterTree(root, concatByAnd(...predicates));
        return res;
    },
);

const getGroupsTreeFilteredAndExpanded = createSelector(
    [getGroupsTreeFiltered, getGroupsExpanded],
    (root, expanded) => {
        const res = cloneDeep(root);
        hammer.treeList.treeForEach(res.children, (node) => {
            const {name} = node;
            if (!expanded[name]) {
                node.children = [];
            }
        });
        return res;
    },
);

const GROUP_FIELDS = {
    name: {
        get(group) {
            return group.name;
        },
        compareFn: compareWithUndefined,
    },
    idm: {
        get(group) {
            return group.idm;
        },
        compareFn: compareWithUndefined,
    },
    size: {
        get({members = []}) {
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

export const getGroupsFlattenTree = createSelector([getGroupsTreeFilteredAndSorted], (root) => {
    return hammer.treeList.flattenTree(root);
});

// Editor
export const getGroupEditorData = (state) => state.groups.editor;
export const getGroupEditorVisible = (state) => state.groups.editor.groupName.length > 0;
export const getGroupEditorGroupName = (state) => state.groups.editor.groupName;
// eslint-disable-next-line camelcase
export const getGroupEditorGroupIdm = (state) =>
    flags.get(state.groups.editor.data.$attributes?.upravlyator_managed);
const getGroupEditorIdmData = (state) => state.groups.editor.idmData;
export const getGroupEditorIdmDataVersion = (state) => state.groups.editor.idmData.version;
export const getGroupEditorIdmDataOtherMembers = (state) =>
    state.groups.editor.idmData.group.other_members;

export const getGroupEditorSubjects = createSelector([getGroupEditorIdmData], (idmData) => {
    const {
        group: {members, responsible},
    } = idmData;
    return {
        responsible: _.map(responsible, ({subject}) => subject),
        members: _.map(members, ({subject}) => subject),
    };
});

export const getGroupEditorRoles = createSelector([getGroupEditorIdmData], (idmData) => {
    const {
        group: {members, responsible},
    } = idmData;
    return {
        responsible,
        members,
    };
});
