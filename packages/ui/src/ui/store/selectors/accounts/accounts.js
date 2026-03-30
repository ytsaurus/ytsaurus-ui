import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import get_ from 'lodash/get';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import set_ from 'lodash/set';

import {createSelector} from 'reselect';
import {ACCOUNTS_TABLE_ID, ROOT_ACCOUNT_NAME} from '../../../constants/accounts/accounts';
import {getTables} from '../../../store/selectors/tables';
import hammer from '../../../common/hammer';
import ypath from '../../../common/thor/ypath';
import {
    selectAccountMasterMemoryMedia,
    selectAccountNames,
    selectAccountsColumnFields,
    selectAccountsMapByName,
    selectAccountsTree,
} from './accounts-ts';
import {concatByAnd} from '../../../common/hammer/predicate';
import {accountMemoryMediumToFieldName} from '../../../utils/accounts/accounts-selector';
import {visitTreeItems} from '../../../utils/utils';

export const selectActiveAccount = (state) => state.accounts.accounts.activeAccount;
export const selectActiveMediumFilter = (state) => state.accounts.accounts.activeMediumFilter;
export const selectUsableAccounts = (state) => state.accounts.accounts.usableAccounts;
export const selectAccountsNameFilter = (state) => state.accounts.accounts.activeNameFilter;
export const selectAccountsAbcServiceIdSlugFilter = (state) =>
    state.accounts.accounts.abcServiceFilter;
export const selectAccountsSortInfo = (state) => getTables(state)[ACCOUNTS_TABLE_ID];

export const selectEditableAccount = (state) => state.accounts.accounts.editableAccount;

const selectEditableAccountSubtreeNames = createSelector(
    [selectAccountsTree, selectEditableAccount],
    prepareSubtreeNames,
);

export const selectEditableAccountParentSuggests = createSelector(
    [selectAccountNames, selectEditableAccountSubtreeNames],
    (allNames, excludeNames) => {
        const excludeNamesSet = new Set(excludeNames);
        return filter_(allNames, (name) => !excludeNamesSet.has(name));
    },
);

const selectFlattenTree = createSelector(
    [
        selectAccountsTree,
        selectActiveAccount,
        selectAccountsNameFilter,
        selectAccountsAbcServiceIdSlugFilter,
    ],
    prepareAccountsFlattenTreeImpl,
);

export const selectActiveAccountSubtree = createSelector(
    selectActiveAccount,
    selectFlattenTree,
    getActiveAccountSubtreeImpl,
);

export const selectActiveAccountAggregationRow = createSelector(
    [selectActiveAccountSubtree, selectAccountMasterMemoryMedia],
    ({activeTreeItem}, masterMemoryMedia) => calcAggregationRow(activeTreeItem, masterMemoryMedia),
);

export const selectActiveAccountSubtreeNames = createSelector(
    selectActiveAccountSubtree,
    getActiveAccountSubtreeNamesImpl,
);

export const selectAccountsFlattenTree = createSelector(
    [selectAccountsSortInfo, selectFlattenTree, selectAccountsColumnFields],
    sortFlattenTree,
);

export function getAccountName(treeItem) {
    const {attributes: account} = treeItem || {};
    return account && account.name;
}

function prepareSubtreeNames(tree, account) {
    if (isEmpty_(tree) || isEmpty_(account)) {
        return [];
    }

    const res = [];
    hammer.treeList.treeForEach(tree[account.name], (node) => {
        res.push(getAccountName(node));
    });
    return res;
}

function prepareAccountsFlattenTreeImpl(treeList, activeAccount, nameFilter = '', {slug} = {}) {
    let root = treeList['<Root>'];
    if (root === undefined) {
        return [];
    }

    if (activeAccount && treeList[activeAccount]) {
        root = {...root, children: [treeList[activeAccount]]};
    }

    let filteredRoot = root;

    const isRoot = (treeNode) => {
        const {attributes: account} = treeNode;
        return treeNode === root || account.name === activeAccount;
    };

    const predicates = [];
    if (nameFilter) {
        predicates.push((treeNode) => {
            const {attributes: account} = treeNode;
            const {name} = account;

            return isRoot(treeNode) || -1 !== name.indexOf(nameFilter);
        });
    }

    if (slug) {
        predicates.push((treeNode) => {
            return isRoot(treeNode) || slug === ypath.getValue(treeNode.attributes, '/@abc/slug');
        });
    }

    if (predicates.length) {
        filteredRoot = hammer.treeList.filterTree(root, concatByAnd(...predicates));
    }

    return filteredRoot;
}

function sortFlattenTree(sortInfo, flattenTree = [], columnFields) {
    if (sortInfo) {
        hammer.treeList.sortTree(flattenTree, sortInfo, columnFields);
    }

    const sortedTree = hammer.treeList.flattenTree(flattenTree);
    return sortedTree;
}

function findByName(treeNode, name) {
    if (name === getAccountName(treeNode)) {
        return treeNode;
    }

    for (const childNode of treeNode.children || []) {
        const res = findByName(childNode, name);
        if (res) {
            return res;
        }
    }

    return undefined;
}

function getActiveAccountSubtreeImpl(activeAccount, treeRoot) {
    if (!activeAccount) {
        return {treeRoot};
    }

    const activeTreeItem = findByName(treeRoot, activeAccount);
    return {treeRoot, activeTreeItem};
}

const AGGREGATION_FIELDS = [
    'totalNodeCount',
    'nodeCountLimit',
    'totalChunkCount',
    'chunkCountLimit',
    'totalTabletCount',
    'tabletCountLimit',
    'totalTabletStaticMemory',
    'tabletStaticMemoryLimit',
    'totalMasterMemory',
    'masterMemoryLimit',
    'master_memory_detailed.nodes',
    'master_memory_detailed.chunks',
    'master_memory_detailed.attributes',
    'master_memory_detailed.tablets',
    'master_memory_detailed.schemas',
];

const AGGREGATION_PER_MEDIUM_FIELDS = ['totalDiskSpace', 'diskSpaceLimit'];
const AGGREGATION_MASTER_MEMORY_FIELDS = ['total', 'limit'];

function addIfDefined(dst, src, key) {
    const srcValue = get_(src, key);
    const dstValue = get_(dst, key);
    if (srcValue === null || srcValue === undefined) {
        return dstValue;
    }

    return (dstValue || 0) + srcValue;
}

function calcAggregationRow(treeItem, masterMemoryMedia) {
    const {children} = treeItem || {};
    if (!children || !children.length) {
        return null;
    }

    const aggAccount = {
        name: 'Aggregation',
        perMedium: {},
    };

    forEach_(children, (treeItem) => {
        const {attributes: acc} = treeItem;
        const account = acc.getResourceInfoSource(true);

        forEach_(AGGREGATION_FIELDS, (key) => {
            set_(aggAccount, key, addIfDefined(aggAccount, account, key));
        });

        forEach_(account.perMedium, (data, mediumType) => {
            forEach_(AGGREGATION_PER_MEDIUM_FIELDS, (key) => {
                let aggMediumData = aggAccount.perMedium[mediumType];
                if (!aggMediumData) {
                    aggMediumData = aggAccount.perMedium[mediumType] = {};
                }
                aggMediumData[key] = addIfDefined(aggMediumData, data, key);
            });
        });

        forEach_(masterMemoryMedia, (medium) => {
            forEach_(AGGREGATION_MASTER_MEMORY_FIELDS, (field) => {
                const srcField = accountMemoryMediumToFieldName('master_memory/' + medium);
                const key = `${srcField}.${field}`;
                set_(aggAccount, key, addIfDefined(aggAccount, account, key));
            });
        });
    });

    const aggTreeItem = {
        isAggregation: true,
        children: [],
        attributes: aggAccount,
        parent: treeItem.name,
        name: treeItem.name + '/Aggregation',
    };

    return aggTreeItem;
}

function getActiveAccountSubtreeNamesImpl({activeTreeItem}) {
    const res = [];
    visitTreeItems(activeTreeItem, (item) => {
        res.push(getAccountName(item));
    });
    return res;
}

export const selectActiveAccountBreadcrumbs = createSelector(
    selectActiveAccount,
    selectAccountsMapByName,
    (activeAccount, nameToAccountMap) => {
        const parentNode = (name) => {
            const account = nameToAccountMap[name] || {attributes: {}};
            return account && account.parent;
        };

        const loaded = nameToAccountMap[activeAccount] !== undefined;
        const namesArr = [];
        if (loaded) {
            let name = activeAccount;
            while (name && name !== ROOT_ACCOUNT_NAME) {
                namesArr.push(name);
                name = parentNode(name);
            }
        }
        const items = [
            {text: '<Accounts>', url: '', title: ''},
            ...map_(namesArr.reverse(), (name) => {
                return {
                    value: name,
                    text: name,
                    url: `?account=${name}`,
                    title: name,
                };
            }),
        ];
        return items;
    },
);
