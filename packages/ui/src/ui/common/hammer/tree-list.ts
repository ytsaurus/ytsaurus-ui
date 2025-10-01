import each_ from 'lodash/each';
import forEach_ from 'lodash/forEach';
import isArray_ from 'lodash/isArray';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';

import {utils} from './utils';

import {OldSortState} from '../../types';

export type TreeNode<T, L, E = {}, LE = E> = E & {
    name: string;
    parent?: string;
    attributes: T;
    children: Array<TreeNode<T, L, E, LE>>;
    leaves: Array<LeafNode<L, LE>>;
    isLeafNode?: false;
    _initedBy?: string;
};

export type LeafNode<L = unknown, E = {}> = E & {
    name: string;
    attributes: L;
    isLeafNode: true;

    parent?: undefined;
};

export type TreeItem<T, L, E = {}, LE = E> = TreeNode<T, L, E> | LeafNode<L, LE>;

export type TreeLeaf<T extends TreeNode<unknown, unknown>> = T['leaves'][number];
export type TreeNodeOrLeaf<T extends TreeNode<unknown, unknown>> = T | TreeLeaf<T>;

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
export function prepareTree<T, L = T, E = {}, LE = E>(
    entries: Record<string, T>,
    parentGetter: (item: T) => string,
) {
    const treeNodeMap: Record<string, TreeNode<T, L, E, LE>> = {};

    each_(entries, (entry, name) => {
        const parentNames = parentGetter(entry);
        const currentEntry = getTreeNode<T, L>(treeNodeMap, name, name);

        if (parentNames) {
            if (isArray_(parentNames)) {
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
    each_(leaves, (leaf, leafName) => {
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

type FilterPredicate<T extends TreeNode<unknown, unknown>, FilterLeaves> = FilterLeaves extends true
    ? (value: T | T['leaves'][number]) => boolean
    : (value: T) => boolean;

/**
 * Filter tree children according to `filterPredicate`.
 * @param tree - a root tree node (or any subtree root node).
 * @param filterPredicate - recieves treeNode as an arguments, return true if it passes a filter test,
 * the same predicate will be used to filter leaves if filterLeaves option is set.
 * @param filterLeaves - determines whether to include all leaves or filter leaves.
 */
export function filterTree<
    T extends TreeNode<unknown, unknown>,
    FilterLeavesT extends undefined | boolean,
>(
    treeNode: T,
    filterPredicate: FilterPredicate<T, FilterLeavesT>,
    filterLeaves?: FilterLeavesT,
): T {
    const treeNodeCopy: typeof treeNode = Object.assign({}, treeNode, {
        children: [],
    });

    // Attach filtered or copied leaves
    if (filterLeaves) {
        treeNodeCopy.leaves = treeNode.leaves.filter(filterPredicate as FilterPredicate<T, true>);
    } else if (filterPredicate(treeNode)) {
        treeNodeCopy.leaves = treeNode.leaves.slice();
    } else {
        treeNodeCopy.leaves = [];
    }

    each_(treeNode.children, (c) => {
        const childEntry = c as typeof treeNode;
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

export function filterTreeEachChild<T extends TreeNode<unknown, unknown>>(
    treeNode: T | undefined,
    nodePredicate: (node: T) => boolean,
    leafPredicate?: (leaf: T['leaves'][number]) => boolean,
    isCollapsed?: (node: T) => boolean,
): T | undefined {
    if (!treeNode) {
        return undefined;
    }

    const collapsed = isCollapsed?.(treeNode);

    const newChildren: typeof treeNode.children = [];
    if (!collapsed) {
        treeNode.children?.reduce((acc, item) => {
            const filtered = filterTreeEachChild(
                item as T,
                nodePredicate,
                leafPredicate,
                isCollapsed,
            );
            if (filtered) {
                acc.push(filtered);
            }
            return acc;
        }, newChildren);
    }

    let newLeaves: typeof treeNode.leaves = [];
    if (!collapsed) {
        newLeaves = leafPredicate
            ? treeNode.leaves?.reduce(
                  (acc, leaf) => {
                      if (leafPredicate(leaf)) {
                          acc.push(leaf);
                      }
                      return acc;
                  },
                  [] as typeof treeNode.leaves,
              )
            : treeNode.leaves;
    }

    const pickByLeaves = leafPredicate ? newLeaves?.length : false;

    if (pickByLeaves || newChildren?.length || nodePredicate(treeNode)) {
        return {...treeNode, leaves: newLeaves, children: newChildren};
    }

    return undefined;
}

export interface FieldDescr<T extends TreeNode<unknown, unknown>> {
    get?: (v: TreeNodeOrLeaf<T>) => unknown;
    sort?: boolean | ((v: TreeNodeOrLeaf<T>) => unknown);
    sortWithUndefined?: boolean;
}

/**
 * Sort tree children and leaves according to sortInfo and fields.
 * @param treeNode - a root tree node (or any subtree root node).
 * @param sortInfo - { field: , asc: }
 * @param fields - description for all possible sort fields in column-like format.
 */
export function sortTree<T extends TreeNode<unknown, unknown>, FieldT extends string>(
    treeNode: T,
    sortInfo: OldSortState,
    fields: Record<FieldT, FieldDescr<T>>,
) {
    treeNode.children = utils.sort(treeNode.children, sortInfo, fields);
    treeNode.leaves = utils.sort(treeNode.leaves, sortInfo, fields);

    treeNode.children = map_(treeNode.children, (c) => {
        const childEntry = c as typeof treeNode;
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

export type FlatItem<T, L> = (LeafNode<L> | TreeNode<T, L>) & FlatItemDetails;

export type FlatItemDetails = {
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
export function flattenTree<T extends TreeNode<unknown, unknown>>(
    treeNode: T,
    level = 0,
    basePath = '',
) {
    basePath += treeNode.name + '/';

    let tree: Array<TreeNodeOrLeaf<T> & FlatItemDetails> = [];

    tree = tree.concat(
        map_(treeNode.leaves, (leaf) => {
            return augmentTreeNode(leaf, level, basePath);
        }),
    );

    each_(treeNode.children, (childNode) => {
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
    if (!nodeOrArray || isEmpty_(nodeOrArray)) {
        return;
    }

    if (Array.isArray(nodeOrArray)) {
        forEach_(nodeOrArray, (item) => treeForEach(item, visitorCb, currentDepth));
    } else {
        visitorCb(nodeOrArray, currentDepth);
        treeForEach(nodeOrArray.children, visitorCb, currentDepth + 1);
    }
}
