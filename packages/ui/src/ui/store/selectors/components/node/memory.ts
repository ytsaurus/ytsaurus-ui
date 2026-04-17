import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import max_ from 'lodash/max';
import sum_ from 'lodash/sum';
import toArray_ from 'lodash/toArray';

import type {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import {NodeMemoryUsagePreload} from '../../../../types/components/node';
import {
    TreeNode,
    filterTree,
    flattenTree,
    prepareTree,
    sortTree,
} from '../../../../common/hammer/tree-list';
import {selectCluster} from '../../../../store/selectors/global';
import {SortState} from '../../../../types';
import {orderTypeToOldSortState} from '../../../../utils/sort-helpers';

export const selectNodeMemory = (state: RootState) => state.components.node.memory;

export const selectNodeMemoryLoaded = (state: RootState) => state.components.node.memory.loaded;

export const selectNodeMemoryLoading = (state: RootState) => state.components.node.memory.loading;

export const selectNodeMemoryError = (state: RootState) => state.components.node.memory.error;

export const selectNodeMemoryViewMode = (state: RootState) => state.components.node.memory.viewMode;

export const selectNodeMemoryFilter = (state: RootState) => state.components.node.memory.filter;

export const selectNodeMemoryStateHost = (state: RootState) => state.components.node.memory.host;

export const selectNodeMemorySortOrder = (state: RootState) =>
    state.components.node.memory.sortOrder;

export const selectNodeMemoryCollapsedBundles = (state: RootState) =>
    state.components.node.memory.collapsedBundles;

const selectNodeMemoryUsageTotal = (state: RootState) => state.components.node.memory.memory?.total;

const selectNodeMemoryUsageBundles = (state: RootState) =>
    state.components.node.memory.memory?.bundles;

const selectNodeMemoryUsageTables = (state: RootState) =>
    state.components.node.memory.memory?.tables;

export const selectNodeMemoryUsageTablesSortOrder = (state: RootState) =>
    state.components.node.memory.tablesSortOrder;

export const selectNodeMemoryUsageTotalStorePreload = createSelector(
    [selectNodeMemoryUsageTotal],
    calculateStorePreload,
);

export const selectNodeMemoryUsageTotalTableStatic = (state: RootState) =>
    state.components.node.memory.memory?.total.tablet_static;

export const selectNodeMemoryUsageTotalRowCache = (state: RootState) =>
    state.components.node.memory.memory?.total.row_cache;

function calculateStorePreload(total?: NodeMemoryUsagePreload) {
    const {
        preload_store_count: allCount = NaN,
        preload_pending_store_count: pending = NaN,
        preload_failed_store_count: failed = NaN,
    } = total || {};

    return {
        allCount,
        pending,
        failed,
        completed: allCount - pending - failed,
    };
}

export const selectNodeMemoryUsageTotalTabletDynamic = createSelector(
    [selectNodeMemoryUsageTotal],
    (total) => {
        const {active, passive, backing, usage, limit, ...others} = total?.tablet_dynamic || {};

        return {
            usage,
            limit,
            active,
            backing,
            passive,
            other: !usage ? 0 : usage - sum_([active, passive, backing, ...toArray_(others)]),
        };
    },
);

export interface NodeMemoryInfo {
    name: string;
    parent: string;
    storePreload: ReturnType<typeof calculateStorePreload>;
    rowCache: number;
    rowCacheLimit: number;
    tabletStatic: number;
    tabletStaticLimit: number;
    tabletDynamic: Record<string, number>;
    tabletDynamicSum: number;
    isBundle?: boolean;
    isCollapsed?: boolean;
    url: string;
}

const selectNodeMemoryUsageBundlesByName = createSelector(
    [selectNodeMemoryUsageBundles, selectCluster],
    (bundles, cluster) => {
        const itemsByName: Record<string, NodeMemoryInfo> = {};

        let maxTabletStatic = 0;
        let maxRowCache = 0;

        forEach_(bundles, ({total}, bundleName) => {
            const {usage, limit: _ignore, ...rest} = total.tablet_dynamic;
            const tmp = (itemsByName[bundleName] = {
                name: bundleName,
                parent: '<Root>',
                storePreload: calculateStorePreload(total),
                rowCache: total.row_cache.usage,
                rowCacheLimit: 0,
                tabletStatic: total.tablet_static.usage,
                tabletStaticLimit: 0,
                tabletDynamic: total.tablet_dynamic,
                tabletDynamicSum: usage ?? sum_(toArray_(rest)),
                isBundle: true,
                url: `/${cluster}/tablet_cell_bundles/tablet_cells?activeBundle=${bundleName}`,
            });

            maxTabletStatic = max_([maxTabletStatic, tmp.tabletStatic])!;
            maxRowCache = max_([maxRowCache, tmp.rowCache])!;
        });

        forEach_(itemsByName, (item) => {
            item.tabletStaticLimit = maxTabletStatic;
            item.rowCacheLimit = maxRowCache;
        });

        return itemsByName;
    },
);

const selectNodeMemoryUsageBundlesTreeRoot = createSelector(
    [selectNodeMemoryUsageBundles, selectNodeMemoryUsageBundlesByName, selectCluster],
    (bundles, bundlesInfo, cluster) => {
        const itemsByName: Record<string, NodeMemoryInfo> = {...bundlesInfo};

        forEach_(bundles, ({cells}, bundleName) => {
            const bundle = itemsByName[bundleName] || {};
            forEach_(cells, (item, cellName) => {
                itemsByName[cellName] = {
                    name: cellName,
                    parent: bundleName,
                    storePreload: calculateStorePreload(item),
                    rowCache: item.row_cache.usage,
                    rowCacheLimit: bundle.rowCache,
                    tabletStatic: item.tablet_static.usage,
                    tabletStaticLimit: bundle.tabletStatic,
                    tabletDynamic: {
                        ...item.tablet_dynamic,
                        limit: bundle.tabletDynamicSum,
                    },
                    tabletDynamicSum: sum_(toArray_(item.tablet_dynamic)),
                    url: `/${cluster}/tablet_cell_bundles/tablet_cells?id=${cellName}&activeBundle=${bundleName}`,
                };
            });
        });

        const root = prepareTree(itemsByName, (item) => item.parent)['<Root>'];
        return root;
    },
);

export const selectNodeMemoryUsageBundlesTreeRootFiltered = createSelector(
    [
        selectNodeMemoryUsageBundlesTreeRoot,
        selectNodeMemoryCollapsedBundles,
        selectNodeMemoryFilter,
    ],
    (root, collapsedBundles, filter) => {
        const collapsed = new Set(collapsedBundles);
        let res: typeof root = {...root};
        if (filter) {
            res = filterTree(
                res,
                (item) => {
                    return item.name.indexOf(filter) !== -1;
                },
                false,
            );
        } else {
            res.children = map_(res.children, (item) => {
                if (!collapsed.has(item.name)) {
                    return item;
                } else {
                    return {
                        ...item,
                        children: [],
                        attributes: {
                            ...item.attributes,
                            isCollapsed: true,
                        },
                    };
                }
            });
        }
        return res;
    },
);

export const selectNodeMemoryUsageBundlesItems = createSelector(
    [selectNodeMemoryUsageBundlesTreeRootFiltered, selectNodeMemorySortOrder],
    (root, [sortOrder]) => {
        if (!root) {
            return [];
        }
        sortTreeInPlace(root, sortOrder);
        return flattenTree(root);
    },
);

function sortTreeInPlace(root: TreeNode<NodeMemoryInfo, NodeMemoryInfo>, sortOrder?: SortState) {
    const {column, order} = sortOrder || {};
    if (column && order) {
        sortTree(root, orderTypeToOldSortState(column, order), {
            name: {
                sort(item) {
                    return item.attributes.name;
                },
                sortWithUndefined: true,
            },
            rowCache: {
                sort(item) {
                    return item.attributes.rowCache;
                },
                sortWithUndefined: true,
            },
            tabletStatic: {
                sort(item) {
                    return item.attributes.tabletStatic;
                },
                sortWithUndefined: true,
            },
            tabletDynamic: {
                sort(item) {
                    return item.attributes.tabletDynamicSum;
                },
                sortWithUndefined: true,
            },
            storePreload: {
                sort(item) {
                    return item.attributes.storePreload.allCount;
                },
                sortWithUndefined: true,
            },
        });
    }
}

const selectAllowBundlesForTables = createSelector([selectNodeMemoryUsageTables], (tables) => {
    const [first] = toArray_(tables);
    return first?.tablet_cell_bundle !== undefined;
});

const selectNodeMemoryUsageTablesAndBundlesByName = createSelector(
    [
        selectAllowBundlesForTables,
        selectNodeMemoryUsageTables,
        selectCluster,
        selectNodeMemoryUsageBundlesByName,
    ],
    (allowBundles, tables, cluster, bundles) => {
        let maxRowCache = 0;
        let maxStatic = 0;
        let maxDynamic = 0;

        const tablesByName: Record<string, NodeMemoryInfo> = allowBundles ? {...bundles} : {};

        forEach_(tables, (item, name) => {
            const parent = allowBundles ? item.tablet_cell_bundle : '<Root>';
            const bundle = bundles[parent] || {};
            const tmp = (tablesByName[name] = {
                name,
                parent,

                storePreload: calculateStorePreload(item),
                rowCache: item.row_cache.usage,
                rowCacheLimit: bundle.rowCache,
                tabletStatic: item.tablet_static.usage,
                tabletStaticLimit: bundle.tabletStatic,
                tabletDynamic: {
                    ...item.tablet_dynamic,
                    limit: bundle.tabletDynamicSum,
                },
                tabletDynamicSum: sum_(toArray_(item.tablet_dynamic)),
                url: `/${cluster}/navigation?path=${encodeURIComponent(name)}`,
            });
            if (!allowBundles) {
                maxDynamic = max_([maxDynamic, tmp.tabletDynamicSum])!;
                maxRowCache = max_([maxRowCache, tmp.rowCache])!;
                maxStatic = max_([maxStatic, tmp.tabletStatic])!;
            }
        });

        if (!allowBundles) {
            forEach_(tablesByName, (item) => {
                if (item.isBundle) {
                    return;
                }

                item.tabletDynamic.limit = maxDynamic;
                item.tabletStaticLimit = maxStatic;
                item.rowCacheLimit = maxRowCache;
            });
        }

        return tablesByName;
    },
);

export const selectNodeMemoryUsageTablesTree = createSelector(
    [selectNodeMemoryUsageTablesAndBundlesByName],
    (tablesAndBundles) => {
        const tree = prepareTree(tablesAndBundles, (item) => item.parent);

        return tree['<Root>'];
    },
);

export const selectNodeMemoryUsageTablesFiltered = createSelector(
    [selectNodeMemoryUsageTablesTree, selectNodeMemoryCollapsedBundles, selectNodeMemoryFilter],
    (root, collapsedBundles, filter) => {
        const collapsed = new Set(collapsedBundles);
        let res: typeof root;
        if (filter) {
            res = filterTree(root, (item: TreeNode<NodeMemoryInfo, NodeMemoryInfo>) => {
                return item.name.indexOf(filter) !== -1;
            });
        } else {
            res = {
                ...root,
                children: map_(root?.children, (item) => {
                    if (!collapsed.has(item.name)) {
                        return item;
                    }
                    const res: typeof item = {
                        ...item,
                        attributes: {
                            ...item.attributes,
                            isCollapsed: true,
                        },
                        children: [],
                    };
                    return res;
                }),
            };
        }

        return res;
    },
);

export const selectNodeMemoryUsageTablesItemsSorted = createSelector(
    [selectNodeMemoryUsageTablesFiltered, selectNodeMemoryUsageTablesSortOrder],
    (root, [sortOrder]) => {
        if (sortOrder && root) {
            sortTreeInPlace(root, sortOrder);
        }

        const items = !root ? [] : flattenTree(root);

        return items;
    },
);
