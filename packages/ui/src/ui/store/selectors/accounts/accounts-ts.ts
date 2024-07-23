import capitalize_ from 'lodash/capitalize';
import forEach_ from 'lodash/forEach';
import get_ from 'lodash/get';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

import {createSelector} from 'reselect';

import {RootState} from '../../../store/reducers';
import {
    ACCOUNT_RESOURCE_TYPES_DESCRIPTION,
    AccountResourceName,
    AccountResourceNameType,
} from '../../../constants/accounts/accounts';
import hammer from '../../../common/hammer';
import {FIX_MY_TYPE} from '../../../types';
import {getMediumListNoCache} from '../thor';
import ypath from '../../../common/thor/ypath';
import {isTopLevelAccount} from '../../../utils/accounts/accounts';
import {accountMemoryMediumToFieldName} from '../../../utils/accounts/accounts-selector';
import {calculateLoadingStatus, isFinalLoadingStatus} from '../../../utils/utils';

const getAccountsLoading = (state: RootState) => state.accounts.accounts.fetching;
const getAccountsLoaded = (state: RootState) => state.accounts.accounts.wasLoaded;
const getAccountsError = (state: RootState) => state.accounts.accounts.error;

export const getAccountsIsFinalLoadingStatus = createSelector(
    [getAccountsLoading, getAccountsLoaded, getAccountsError],
    (loading, loaded, error) => {
        const status = calculateLoadingStatus(loading, loaded, error);
        return isFinalLoadingStatus(status);
    },
);

export const getActiveAccount = (state: RootState) => state.accounts.accounts.activeAccount;
export const getActiveMediumFilter = (state: RootState) =>
    state.accounts.accounts.activeMediumFilter;
export const getAccountsContentMode = (state: RootState) =>
    state.accounts.accounts.activeContentModeFilter;
export const getAccountsMasterMemoryContentMode = (state: RootState) =>
    state.accounts.accounts.masterMemoryContentMode;
export const getEditableAccount = (state: RootState) =>
    state.accounts.accounts.editableAccount as AccountSelector;

export const getAccountsDisabledCacheForNextFetch = (state: RootState) =>
    state.accounts.accounts.disableCacheForNextFetch;
export const getAccountsEditCounter = (state: RootState) => state.accounts.accounts.editCounter;

export interface AccountSelector {
    name: string;
    alertsCount: number;
    perMedium: {[key: string]: number};

    $value: string;
    $attributes: unknown;
    parent?: string;

    master_memory_detailed: {
        nodes?: number;
        chunks?: number;
        attributes?: number;
        tablets?: number;
        schemas?: number;
    };

    getDiskSpaceProgressInfo(mediumType: string, recursive?: boolean): ProgressInfo;

    getNodeCountProgressInfo(recursive?: boolean): ProgressInfo;
    getChunkCountProgressInfo(recursive?: boolean): ProgressInfo;
    getTabletStaticMemoryInfo(recursive?: boolean): ProgressInfo;
}

interface ProgressInfo {
    total?: number;
    limit?: number;
}

interface AccountsAggregation {
    totalNodeCount: number;
    nodeCountLimit: number;

    totalChunkCount: number;
    chunkCountLimit: number;

    perMedium: {
        [mediumType: string]: {
            totalDiskSpace: number;
            diskSpaceLimit: number;
        };
    };

    totalTabletCount: number;
    tabletCountLimit: number;

    totalTabletStaticMemory: number;
    tabletStaticMemoryLimit: number;

    totalMasterMemory: number;
    masterMemoryLimit: number;
}

export interface AccountsTreeItem {
    attributes: AccountSelector;
    isAggregation: boolean;
}

export interface AccountStaticConfigurationItem {
    name: string;
    level?: number;

    format: 'Bytes' | 'Number';
    total?: number;
    used?: number;
    free?: number;
}

const getAccounts = (state: RootState) =>
    state.accounts.accounts.accounts as Array<AccountSelector>;

export const getAccountNames = createSelector(getAccounts, (items: Array<FIX_MY_TYPE>) =>
    map_(items, (i) => i.$value).sort(),
);

export const getAccountsMapByName = createSelector(getAccounts, (accounts) => {
    const nameToAccountMap: Record<string, AccountSelector> = {};
    forEach_(accounts, (item) => {
        nameToAccountMap[item.name] = item;
    });
    return nameToAccountMap;
});

export const getAccountsTree = createSelector([getAccountsMapByName], prepareAccountsTree);

type Tree<T> = {
    attributes: T;
    children: Array<T>;
    name: string;
    parent?: string;
};

export type AccountsTree = Tree<AccountSelector>;

function prepareAccountsTree(
    nameToAccountMap: Record<string, AccountSelector>,
): Record<string, AccountsTree> {
    const tree = hammer.treeList.prepareTree(nameToAccountMap, (item: AccountSelector) => {
        if (nameToAccountMap[item.parent!] === undefined) {
            // specific case when parent account is removed
            // child should be attahed to the upper level
            return '<Root>';
        }

        return item.parent || '<Root>';
    });

    return tree;
}

function makeStaticConfigurationItem(
    name: string,
    format: 'Bytes' | 'Number',
    {total, limit}: {total?: number; limit?: number},
    level?: number,
): [AccountStaticConfigurationItem] | [] {
    if (!total && !limit) {
        return [];
    }

    return [
        {
            name,
            level,
            format,
            used: total,
            total: limit,
            free: (limit || 0) - (total || 0),
        },
    ];
}

export const getActiveAccountStaticConfiguration = createSelector(
    [getActiveAccount, getAccountsTree, getMediumListNoCache],
    (activeAccount, tree = {}, mediums = []) => {
        const item = tree[activeAccount];
        if (!item) {
            return [];
        }

        const mediumsInfo: Array<AccountStaticConfigurationItem> = [];
        for (const i of mediums) {
            mediumsInfo.push(
                ...makeStaticConfigurationItem(
                    capitalize_(i),
                    'Bytes',
                    item.attributes.getDiskSpaceProgressInfo(i, true),
                    1,
                ),
            );
        }

        if (mediumsInfo.length) {
            mediumsInfo.splice(0, 0, {
                name: 'Media',
                format: 'Number',
            });
        }

        const res: Array<AccountStaticConfigurationItem> = [
            ...mediumsInfo,
            ...makeStaticConfigurationItem(
                'Nodes',
                'Number',
                item.attributes.getNodeCountProgressInfo(true),
            ),
            ...makeStaticConfigurationItem(
                'Chunks',
                'Number',
                item.attributes.getChunkCountProgressInfo(true),
            ),
        ];

        return res;
    },
);

function getAggregatedByType(
    aggr: AccountsAggregation,
    type: AccountResourceNameType,
    mediumType = '',
) {
    switch (type) {
        case AccountResourceName.DISK_SPACE_PER_MEDIUM:
            return {
                progress: undefined,
                total: aggr.perMedium[mediumType]?.totalDiskSpace,
                limit: aggr.perMedium[mediumType]?.diskSpaceLimit,
            };
        case AccountResourceName.NODE_COUNT:
            return {
                progress: undefined,
                total: aggr.totalNodeCount,
                limit: aggr.nodeCountLimit,
            };
        case AccountResourceName.CHUNK_COUNT:
            return {
                progress: undefined,
                total: aggr.totalChunkCount,
                limit: aggr.chunkCountLimit,
            };
        case AccountResourceName.TABLET_STATIC_MEMORY:
            return {
                progress: undefined,
                total: aggr.totalTabletStaticMemory,
                limit: aggr.tabletStaticMemoryLimit,
            };
        case AccountResourceName.TABLET_COUNT:
            return {
                progress: undefined,
                total: aggr.totalTabletCount,
                limit: aggr.tabletCountLimit,
            };
        case AccountResourceName.MASTER_MEMORY: {
            const {total, limit} =
                get_(aggr, accountMemoryMediumToFieldName('master_memory/' + mediumType)) || {};
            return {progress: undefined, total, limit};
        }
    }
}

function getResourceInfo(
    entry: AccountsTreeItem,
    type: AccountResourceNameType,
    activeAccount?: string,
    mediumType?: string,
) {
    if (entry.isAggregation) {
        return getAggregatedByType(entry.attributes as any, type, mediumType);
    }
    const {getInfo} = ACCOUNT_RESOURCE_TYPES_DESCRIPTION[type];
    const name = getAccountName(entry);
    const recursive = name !== activeAccount;
    return getInfo(entry.attributes, recursive, mediumType);
}

export const getAccountMasterMemoryMedia = createSelector([getAccounts], (items = []) => {
    const [item] = items;
    if (!item) {
        return [];
    }

    const perCell = ypath.getValue(item, '/@resource_usage/master_memory/per_cell');
    const mediums = map_(keys_(perCell), (key) => {
        return `per_cell/${key}`;
    });

    return ['total', 'chunk_host', ...mediums];
});

const getAccountsMasterMemoryColumns = createSelector(
    [getActiveAccount, getAccountsMasterMemoryContentMode],
    (activeAccount, medium) => {
        return {
            master_memory_percentage: {
                get: (entry: AccountsTreeItem) => {
                    const data =
                        getResourceInfo(
                            entry,
                            AccountResourceName.MASTER_MEMORY,
                            activeAccount,
                            medium,
                        ) || {};
                    return data.progress;
                },
            },
            master_memory_usage: {
                get: (entry: AccountsTreeItem) => {
                    const data =
                        getResourceInfo(
                            entry,
                            AccountResourceName.MASTER_MEMORY,
                            activeAccount,
                            medium,
                        ) || {};
                    return data.total;
                },
            },
            master_memory_limit: {
                get: (entry: AccountsTreeItem) => {
                    const data =
                        getResourceInfo(
                            entry,
                            AccountResourceName.MASTER_MEMORY,
                            activeAccount,
                            medium,
                        ) || {};
                    return data.limit;
                },
            },
            master_memory_free: {
                get: (entry: AccountsTreeItem) => {
                    const {total, limit} =
                        getResourceInfo(entry, AccountResourceName.MASTER_MEMORY, '', medium) || {};
                    return total !== undefined && limit - total;
                },
            },

            master_memory_detailed_nodes: {
                get(item: AccountsTreeItem) {
                    const {
                        attributes: {master_memory_detailed: data},
                    } = item;
                    return data?.nodes;
                },
            },

            master_memory_detailed_chunks: {
                get(item: AccountsTreeItem) {
                    const {
                        attributes: {master_memory_detailed: data},
                    } = item;
                    return data?.chunks;
                },
            },

            master_memory_detailed_attributes: {
                get(item: AccountsTreeItem) {
                    const {
                        attributes: {master_memory_detailed: data},
                    } = item;
                    return data?.attributes;
                },
            },

            master_memory_detailed_tablets: {
                get(item: AccountsTreeItem) {
                    const {
                        attributes: {master_memory_detailed: data},
                    } = item;
                    return data?.tablets;
                },
            },

            master_memory_detailed_schemas: {
                get(item: AccountsTreeItem) {
                    const {
                        attributes: {master_memory_detailed: data},
                    } = item;
                    return data?.schemas;
                },
            },
        };
    },
);

export const getAccountsColumnFields = createSelector(
    [getActiveAccount, getActiveMediumFilter, getAccountsMasterMemoryColumns],
    (activeAccount, mediumType, accountsColumns) => {
        const res = {
            name: {
                get: (entry: AccountsTreeItem) => {
                    return entry.attributes.name;
                },
            },
            alerts: {
                get: (entry: AccountsTreeItem) => {
                    return entry.attributes.alertsCount;
                },
            },
            disk_space_default: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(
                        entry,
                        'disk_space_per_medium',
                        activeAccount,
                        mediumType,
                    );

                    return data && data.total;
                },
            },
            disk_space_percentage: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(
                        entry,
                        'disk_space_per_medium',
                        activeAccount,
                        mediumType,
                    );

                    return data && data.progress;
                },
            },
            disk_space_usage: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(
                        entry,
                        'disk_space_per_medium',
                        activeAccount,
                        mediumType,
                    );

                    return data && data.total;
                },
            },
            disk_space_limit: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(
                        entry,
                        'disk_space_per_medium',
                        activeAccount,
                        mediumType,
                    );

                    return data && data.limit;
                },
            },
            disk_space_free: {
                get: (entry: AccountsTreeItem) => {
                    const {limit, total} =
                        getResourceInfo(entry, 'disk_space_per_medium', '', mediumType) || {};

                    return total !== undefined && limit - total;
                },
            },
            node_count_default: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'node_count', activeAccount) || {};
                    return data.progress;
                },
            },
            node_count_percentage: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'node_count', activeAccount) || {};
                    return data.progress;
                },
            },
            node_count_usage: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'node_count', activeAccount) || {};
                    return data.total;
                },
            },
            node_count_limit: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'node_count', activeAccount) || {};
                    return data.limit;
                },
            },
            node_count_free: {
                get: (entry: AccountsTreeItem) => {
                    const {total, limit} = getResourceInfo(entry, 'node_count', '') || {};
                    return total !== undefined && limit - total;
                },
            },
            chunk_count_default: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'chunk_count', activeAccount) || {};
                    return data.progress;
                },
            },
            chunk_count_percentage: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'chunk_count', activeAccount) || {};
                    return data.progress;
                },
            },
            chunk_count_usage: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'chunk_count', activeAccount) || {};
                    return data.total;
                },
            },
            chunk_count_limit: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'chunk_count', activeAccount) || {};
                    return data.limit;
                },
            },
            chunk_count_free: {
                get: (entry: AccountsTreeItem) => {
                    const {total, limit} = getResourceInfo(entry, 'chunk_count', '') || {};
                    return total !== undefined && limit - total;
                },
            },
            tablet_count_percentage: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'tablet_count', activeAccount) || {};
                    return data.progress;
                },
            },
            tablet_count_usage: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'tablet_count', activeAccount) || {};
                    return data.total;
                },
            },
            tablet_count_limit: {
                get: (entry: AccountsTreeItem) => {
                    const data = getResourceInfo(entry, 'tablet_count', activeAccount) || {};
                    return data.limit;
                },
            },
            tablet_count_free: {
                get: (entry: AccountsTreeItem) => {
                    const {total, limit} = getResourceInfo(entry, 'tablet_count', '') || {};
                    return total !== undefined && limit - total;
                },
            },
            tablet_static_memory_percentage: {
                get: (entry: AccountsTreeItem) => {
                    const data =
                        getResourceInfo(entry, 'tablet_static_memory', activeAccount) || {};
                    return data.progress;
                },
            },
            tablet_static_memory_usage: {
                get: (entry: AccountsTreeItem) => {
                    const data =
                        getResourceInfo(entry, 'tablet_static_memory', activeAccount) || {};
                    return data.total;
                },
            },
            tablet_static_memory_limit: {
                get: (entry: AccountsTreeItem) => {
                    const data =
                        getResourceInfo(entry, 'tablet_static_memory', activeAccount) || {};
                    return data.limit;
                },
            },
            tablet_static_memory_free: {
                get: (entry: AccountsTreeItem) => {
                    const {total, limit} = getResourceInfo(entry, 'tablet_static_memory', '') || {};
                    return total !== undefined && limit - total;
                },
            },
            ...accountsColumns,
        };
        return res;
    },
);

export function getAccountName(treeItem?: {attributes: AccountSelector}) {
    const {attributes: account} = treeItem || {};
    return account && account.name;
}

export const getEditableAccountQuotaSources = createSelector(
    [getAccountsTree, getEditableAccount],
    (tree, account) => {
        if (!account?.name || !tree) {
            return [];
        }
        const res = collectSubtreeItems(account.name, tree);

        return res.sort();
    },
);

function collectSubtreeItems(
    account: string,
    tree: Record<string, AccountsTree>,
    collected = new Set<string>(),
): Array<string> {
    if (collected.has(account)) {
        return [];
    }

    collected.add(account);

    const res = [] as Array<string>;
    const {parent, children, attributes} = tree[account] || {};
    const isTopLevel = isTopLevelAccount(attributes);
    if (parent && tree[parent] && !isTopLevel && !collected.has(parent)) {
        res.push(parent);
        const parentItems = collectSubtreeItems(parent, tree, collected);
        res.push(...parentItems);
    }
    forEach_(children, (item) => {
        if (collected.has(item.name)) {
            return;
        }
        res.push(item.name);
        const childItems = collectSubtreeItems(item.name, tree, collected);
        res.push(...childItems);
    });
    return res;
}

export const isEditableAccountOfTopLevel = createSelector(
    [getAccountsMapByName, getEditableAccount],
    (mapByName, account) => {
        return isTopLevelAccount(mapByName[account?.name]);
    },
);
