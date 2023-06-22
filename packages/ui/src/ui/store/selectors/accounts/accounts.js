import _ from 'lodash';
import {createSelector} from 'reselect';
import {ACCOUNTS_TABLE_ID, ROOT_ACCOUNT_NAME} from '../../../constants/accounts/accounts';
import {getTables} from '../../../store/selectors/tables';
import hammer from '../../../common/hammer';
import ypath from '../../../common/thor/ypath';
import {
    getAccountMasterMemoryMedia,
    getAccountNames,
    getAccountsColumnFields,
    getAccountsMapByName,
    getAccountsTree,
} from './accounts-ts';
import {concatByAnd} from '../../../common/hammer/predicate';
import {accountMemoryMediumToFieldName} from '../../../utils/accounts/accounts-selector';
import {visitTreeItems} from '../../../utils/utils';

export const getActiveAccount = (state) => state.accounts.accounts.activeAccount;
export const getActiveMediumFilter = (state) => state.accounts.accounts.activeMediumFilter;
export const getUsableAccounts = (state) => state.accounts.accounts.usableAccounts;
export const getAccountsNameFilter = (state) => state.accounts.accounts.activeNameFilter;
export const getAccountsAbcServiceIdSlugFilter = (state) =>
    state.accounts.accounts.abcServiceFilter;
export const getAccountsSortInfo = (state) => getTables(state)[ACCOUNTS_TABLE_ID];

export const getEditableAccount = (state) => state.accounts.accounts.editableAccount;

const getEditableAccountSubtreeNames = createSelector(
    [getAccountsTree, getEditableAccount],
    prepareSubtreeNames,
);

export const getEditableAccountParentSuggests = createSelector(
    [getAccountNames, getEditableAccountSubtreeNames],
    (allNames, excludeNames) => {
        const excludeNamesSet = new Set(excludeNames);
        return _.filter(allNames, (name) => !excludeNamesSet.has(name));
    },
);

const getFlattenTree = createSelector(
    [getAccountsTree, getActiveAccount, getAccountsNameFilter, getAccountsAbcServiceIdSlugFilter],
    prepareAccountsFlattenTreeImpl,
);

export const getActiveAccountSubtree = createSelector(
    getActiveAccount,
    getFlattenTree,
    getActiveAccountSubtreeImpl,
);

export const getActiveAccountAggregationRow = createSelector(
    [getActiveAccountSubtree, getAccountMasterMemoryMedia],
    ({activeTreeItem}, masterMemoryMedia) => calcAggregationRow(activeTreeItem, masterMemoryMedia),
);

export const getActiveAccountSubtreeNames = createSelector(
    getActiveAccountSubtree,
    getActiveAccountSubtreeNamesImpl,
);

export const prepareAccountsFlattenTree = createSelector(
    [getAccountsSortInfo, getFlattenTree, getAccountsColumnFields],
    sortFlattenTree,
);

export function getAccountName(treeItem) {
    const {attributes: account} = treeItem || {};
    return account && account.name;
}

function prepareSubtreeNames(tree, account) {
    if (_.isEmpty(tree) || _.isEmpty(account)) {
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
    const srcValue = _.get(src, key);
    const dstValue = _.get(dst, key);
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

    _.forEach(children, (treeItem) => {
        const {attributes: account} = treeItem;
        _.forEach(AGGREGATION_FIELDS, (key) => {
            _.set(aggAccount, key, addIfDefined(aggAccount, account, key));
        });

        _.forEach(account.perMedium, (data, mediumType) => {
            _.forEach(AGGREGATION_PER_MEDIUM_FIELDS, (key) => {
                let aggMediumData = aggAccount.perMedium[mediumType];
                if (!aggMediumData) {
                    aggMediumData = aggAccount.perMedium[mediumType] = {};
                }
                aggMediumData[key] = addIfDefined(aggMediumData, data, key);
            });
        });

        _.forEach(masterMemoryMedia, (medium) => {
            _.forEach(AGGREGATION_MASTER_MEMORY_FIELDS, (field) => {
                const srcField = accountMemoryMediumToFieldName('master_memory/' + medium);
                const key = `${srcField}.${field}`;
                _.set(aggAccount, key, addIfDefined(aggAccount, account, key));
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

export const getActiveAccountBreadcrumbs = createSelector(
    getActiveAccount,
    getAccountsMapByName,
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
            ..._.map(namesArr.reverse(), (name) => {
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
