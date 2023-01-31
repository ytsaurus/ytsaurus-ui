import {utils} from './utils';
import _ from 'lodash';
import {OldSortState} from '../../types';

export interface TreeNode<T, L> {
    name: string;
    parent?: string | Array<string>;
    attributes: T;
    children: Array<TreeNode<T, L>>;
    leaves: Array<LeafNode<L>>;
    isLeafNode?: false;
}

export interface LeafNode<L = unknown> {
    name: string;
    attributes: L;
    isLeafNode: true;
}

export type TreeItem<T, L> = TreeNode<T, L> | LeafNode<L>;

/**
 * Create a treeNode with a given name or return an existing treeNode
 * @param treeNodes - map of all tree nodes
 * @param name - name of a treeNode in treeNodes map
 * @param initedBy - name of a treeNode that created this tree node initially
 */
function getTreeNode<T, L>(
    treeNodes: Record<string, TreeNode<T, L>>,
    name: string,
    initedBy: string,
): TreeNode<T, L> {
    treeNodes[name] = treeNodes[name] || {
        name: name,
        attributes: {},
        children: [],
        leaves: [],
        _initedBy: initedBy, // needed for debug purposes in case of inconsistent data
    };

    return treeNodes[name];
}

function getTreeLeafNode<L>(leafNode: L, name: string): LeafNode<L> {
    return {
        name: name,
        attributes: leafNode,
        isLeafNode: true,
    };
}

/**
 * Recreate a map of input entries adding tree-related fields. Depending on parentGetter behavior,
 * a fake root node can be added to the output data.
 * @param entries - input data in map format { treeNodeName: treeNodeData }
 * @param parentGetter - returns an array of parents or a single parent treeNode name
 */
export function prepareTree<T, L = T>(
    entries: Record<string, T>,
    parentGetter: (item: T) => string | Array<string>,
) {
    const treeNodeMap: Record<string, TreeNode<T, L>> = {};

    _.each(entries, (entry, name) => {
        const parentNames = parentGetter(entry);
        const currentEntry = getTreeNode<T, L>(treeNodeMap, name, name);

        if (parentNames) {
            if (_.isArray(parentNames)) {
                parentNames.forEach((parentName) => {
                    getTreeNode(treeNodeMap, parentName, name).children.push(currentEntry);
                });
            } else {
                getTreeNode(treeNodeMap, parentNames, name).children.push(currentEntry);
            }
        }

        currentEntry.parent = parentNames;
        currentEntry.attributes = entry;
    });

    return treeNodeMap;
}

/**
 * Attach leaf nodes to a tree
 * @param tree - map of all tree nodes, returned by prepareTree method
 * @param leaves - map of all leaves in format { treeLeafName: treeLeafData }
 * @param parentGetter - returns a single parent treeNode name
 */
export function attachTreeLeaves<T, L>(
    treeNodeMap: Record<string, TreeNode<T, L>>,
    leaves: Record<string, L>,
    parentGetter: (leaf: L) => string,
) {
    _.each(leaves, (leaf, leafName) => {
        const treeNodeName = parentGetter(leaf);
        const treeNode = treeNodeMap[treeNodeName];

        if (treeNode) {
            treeNode.leaves.push(getTreeLeafNode(leaf, leafName));
        } else {
            console.error(
                'Tree leaf with name "%s" has an unknown parent "%s"',
                leafName,
                treeNodeName,
            );
        }
    });

    return treeNodeMap;
}

function truthyFilterPredicate() {
    return true;
}

type FilterPredicate<T, L, FilterLeaves> = FilterLeaves extends true
    ? (value: TreeItem<T, L>) => boolean
    : (value: TreeNode<T, L>) => boolean;

/**
 * Filter tree children according to `filterPredicate`.
 * @param tree - a root tree node (or any subtree root node).
 * @param filterPredicate - recieves treeNode as an arguments, return true if it passes a filter test,
 * the same predicate will be used to filter leaves if filterLeaves option is set.
 * @param filterLeaves - determines whether to include all leaves or filter leaves.
 */
export function filterTree<T, L, FilterLeavesT extends undefined | boolean>(
    treeNode: TreeNode<T, L>,
    filterPredicate: FilterPredicate<T, L, FilterLeavesT>,
    filterLeaves?: FilterLeavesT,
) {
    const treeNodeCopy: typeof treeNode = Object.assign({}, treeNode, {
        children: [],
    });

    // Attach filtered or copied leaves
    if (filterLeaves) {
        treeNodeCopy.leaves = treeNode.leaves.filter(
            filterPredicate as (v: LeafNode<L>) => boolean,
        );
    } else if (filterPredicate(treeNode)) {
        treeNodeCopy.leaves = treeNode.leaves.slice();
    } else {
        treeNodeCopy.leaves = [];
    }

    _.each(treeNode.children, (childEntry) => {
        if (filterPredicate(childEntry)) {
            const copiedChildEntry = filterTree(childEntry, truthyFilterPredicate, filterLeaves);

            treeNodeCopy.children.push(copiedChildEntry);
        } else {
            const filteredChildEntry = filterTree(childEntry, filterPredicate, filterLeaves);

            if (filteredChildEntry.children.length || filteredChildEntry.leaves.length) {
                treeNodeCopy.children.push(filteredChildEntry);
            }
        }
    });

    return treeNodeCopy;
}

export interface FieldDescr<T, L> {
    get?: (v: TreeItem<T, L>) => unknown;
    sort?: (v: TreeItem<T, L>) => unknown;
    sortWithUndefined?: boolean;
}

/**
 * Sort tree children and leaves according to sortInfo and fields.
 * @param treeNode - a root tree node (or any subtree root node).
 * @param sortInfo - { field: , asc: }
 * @param fields - description for all possible sort fields in column-like format.
 */
export function sortTree<T, L, FieldT extends string>(
    treeNode: TreeNode<T, L>,
    sortInfo: OldSortState,
    fields: Record<FieldT, FieldDescr<T, L>>,
) {
    treeNode.children = utils.sort(treeNode.children, sortInfo, fields);
    treeNode.leaves = utils.sort(treeNode.leaves, sortInfo, fields);

    treeNode.children = _.map(treeNode.children, (childEntry) => {
        return sortTree(childEntry, sortInfo, fields);
    });

    return treeNode;
}

function augmentTreeNode<T extends {name: string}>(entry: T, level: number, basePath: string) {
    return Object.assign({}, entry, {
        level: level,
        key: basePath + entry.name,
    });
}

export type FlatItem<T, L> = (LeafNode<L> | TreeNode<T, L>) & {
    key?: string;
    level?: number;
};

/**
 * Flattens the `treeNode` object to an Array representation. In order to display tree-like
 * features using Array data, level and key properties are added. `level` denotes the distance
 * of a tree node from the root node, and `key` provides a unique path of a tree node from the
 * tree root (needed for rendering graphs where a single node could belong to more than one
 * parent).
 * @param treeNode - tree node where to start (root node)
 * @param level - used for calculating level of a tree node
 * @param basePath - used for calculating tree node unique key
 */
export function flattenTree<T, L>(
    treeNode: Pick<TreeNode<T, L>, 'children' | 'leaves' | 'name'>,
    level = 0,
    basePath = '',
) {
    basePath += treeNode.name + '/';

    let tree: Array<FlatItem<T, L>> = [];

    tree = tree.concat(
        _.map(treeNode.leaves, (leaf) => {
            return augmentTreeNode(leaf, level, basePath);
        }),
    );

    _.each(treeNode.children, (childNode) => {
        childNode = augmentTreeNode(childNode, level, basePath);

        tree.push(childNode);
        tree = tree.concat(flattenTree(childNode, level + 1, basePath));
    });

    return tree;
}

export function treeForEach<T extends {children?: Array<T>}>(
    nodeOrArray: undefined | T | Array<T>,
    visitorCb: (item: T, currentDepth: number) => void,
    currentDepth = 0,
) {
    if (!nodeOrArray || _.isEmpty(nodeOrArray)) {
        return;
    }

    if (Array.isArray(nodeOrArray)) {
        _.forEach(nodeOrArray, (item) => treeForEach(item, visitorCb, currentDepth));
    } else {
        visitorCb(nodeOrArray, currentDepth);
        treeForEach(nodeOrArray.children, visitorCb, currentDepth + 1);
    }
}
