import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import map_ from 'lodash/map';

import hammer from '../../../common/hammer';
import * as treeList from '../../../common/hammer/tree-list';

import {createSelector} from 'reselect';
import {selectCluster} from '../../../store/selectors/global';

import {prepareResources} from '../../../utils/scheduling/overview';
import {childTableItems} from '../../../utils/scheduling/detailsTable';

import {ROOT_POOL_NAME} from '../../../constants/scheduling';

import {type OldSortState} from '../../../types';

import {selectPools as selectPoolsImpl, selectSchedulingPoolsMapByName} from './scheduling-pools';
import {type RootState} from '../../../store/reducers';
import {isAbcPoolName, isTopLevelPool} from '../../../utils/scheduling/pool';
import {type PoolTreeNode} from '../../../utils/scheduling/pool-child';
import {orderTypeToOldSortState} from '../../../utils/sort-helpers';
import {visitTreeItems} from '../../../utils/utils';
import {selectSchedulingOperationsExpandedPools} from './expanded-pools';
import {
    selectSchedulingAttributesToFilter,
    selectSchedulingFilteredPoolNames,
} from './attributes-to-filter';

export const selectPools = selectPoolsImpl;

export const selectSchedulingLoading = (state: RootState) => {
    const {loading, poolLoading} = state.scheduling.scheduling;
    return loading || poolLoading;
};

const selectExpandedPoolsIsInitialLoading = (state: RootState) => {
    const {loaded, loading} = state.scheduling.expandedPools;
    return !loaded && loading;
};

export const selectSchedulingIsInitialLoading = (state: RootState) => {
    const {loaded, loading} = state.scheduling.scheduling;
    return (!loaded && loading) || selectExpandedPoolsIsInitialLoading(state);
};

export const selectTreeResources = (state: RootState) => state.scheduling.scheduling.treeResources;
export const selectSchedulingTreeMainResource = (state: RootState) =>
    state.scheduling.scheduling.treeResources.config?.main_resource;

export const selectPoolChildrenFilter = (state: RootState) =>
    state.scheduling.scheduling.poolChildrenFilter;
const selectSchedulingContentModeRaw = (state: RootState) =>
    state.scheduling.scheduling.contentMode;

export const selectTree = (state: RootState) => state.scheduling.scheduling.tree;
export const selectTrees = (state: RootState) => state.scheduling.scheduling.trees;

export const selectPool = (state: RootState) => state.scheduling.scheduling.pool;

export const selectSchedulingError = (state: RootState) => {
    const {error, errorData} = state.scheduling.scheduling;
    return error ? errorData : undefined;
};

export const selectSchedulingShowAbsResources = (state: RootState) =>
    state.scheduling.scheduling.showAbsResources;

export const selectSchedulingEditItem = (state: RootState) => state.scheduling.scheduling.editItem;

export const selectCurrentPool = createSelector([selectPool, selectPools], (pool, pools) => {
    const res = find_(pools, (item) => item.name === pool);
    return res;
});

export const selectSchedulingSortState = (state: RootState) =>
    state.scheduling.scheduling.sortState;

export const selectSchedulingEffectiveSortState = createSelector(
    [selectSchedulingSortState, selectCurrentPool],
    (sortState, pool): OldSortState => {
        if (!sortState?.length) {
            return pool?.mode === 'fifo' ? {field: 'FI', asc: true} : {field: 'name', asc: true};
        }

        const [{column, order} = {}] = sortState;

        return orderTypeToOldSortState(column, order);
    },
);

export const selectPoolsNames = createSelector(
    selectSchedulingAttributesToFilter,
    (pools): Array<string> => map_(pools, (_v, name) => name).sort(),
);

export const SCHEDULING_CONTENT_MODES = [
    'summary',
    'cpu',
    'memory',
    'gpu',
    'user_slots',
    'operations',
    'integral_guarantees',
    'custom',
] as const;

export type SchedulingContentMode = (typeof SCHEDULING_CONTENT_MODES)[number];

export const selectSchedulingContentMode = createSelector(
    [selectSchedulingContentModeRaw],
    (mode) => {
        const index = SCHEDULING_CONTENT_MODES.indexOf(mode as any);
        return SCHEDULING_CONTENT_MODES[index !== -1 ? index : 0];
    },
);

export const selectSchedulingIsRoot = createSelector(selectPool, (pool) => pool === ROOT_POOL_NAME);

export const selectTreesSelectItems = createSelector(selectTrees, (trees) =>
    map_(trees, (tree) => ({
        value: tree,
        content: hammer.format['Readable'](tree) as string,
    })),
);

export const selectPoolsSelectItems = createSelector(selectPoolsNames, (pools) => {
    const items = map_(pools, (pool) => ({
        value: pool,
        content: pool,
    }));

    return items;
});

export const selectPoolIsEphemeral = createSelector([selectCurrentPool], (currentPool) => {
    if (currentPool && currentPool.isEphemeral !== undefined) return currentPool.isEphemeral;
    return undefined;
});

export const selectCurrentPoolChildren = createSelector(selectCurrentPool, (currentPool) => {
    if (currentPool) {
        return currentPool.children;
    }

    return undefined;
});

export const selectCurrentPoolOperations = createSelector(selectCurrentPool, (currentPool) => {
    if (currentPool) {
        return currentPool.leaves;
    }

    return undefined;
});

export const selectResources = createSelector(
    [selectCurrentPool, selectTreeResources],
    (currentPool, resources) => {
        if (currentPool && currentPool.name !== '<Root>') {
            return prepareResources(currentPool.attributes);
        } else if (resources) {
            return prepareResources(resources);
        }

        return [];
    },
);

export const selectCurrentTreeExpandedPools = createSelector(
    [selectTree, selectSchedulingOperationsExpandedPools],
    (tree, expandedPools) => {
        return expandedPools[tree];
    },
);

const selectSchedulingOverviewFilteredTree = createSelector(
    [selectCurrentPool, selectSchedulingFilteredPoolNames, selectCurrentTreeExpandedPools],
    (treeRoot, visiblePools, expandedPools) => {
        if (treeRoot) {
            const res = treeList.filterTreeEachChild(
                treeRoot,
                (pool: {name: string; parent?: string}) => {
                    const {name} = pool;
                    return visiblePools === undefined || visiblePools.has(name);
                },
                undefined,
                function isCollapsed({name}) {
                    return name !== ROOT_POOL_NAME && !expandedPools?.has(name);
                },
            );
            return res;
        }
        return undefined;
    },
);

export const selectSchedulingOverviewTableItems = createSelector(
    [selectSchedulingOverviewFilteredTree, selectSchedulingEffectiveSortState],
    (filteredTree, sortState) => {
        if (filteredTree) {
            const isRoot = filteredTree && filteredTree.name === ROOT_POOL_NAME;
            const tree = isRoot
                ? filteredTree
                : ({
                      name: '',
                      children: [filteredTree],
                      leaves: [],
                      attributes: {},
                      type: 'pool',
                  } as PoolTreeNode);
            const sortedTree = sortState.field
                ? treeList.sortTree(tree, sortState, childTableItems)
                : tree;

            return treeList.flattenTree(sortedTree);
        }

        return [];
    },
);

// The same cluster is ready for bundle's ACL
const CLUSTERS_WITHOUT_POOL_ACL = ['locke'];

export const selectIsPoolAclAllowed = createSelector([selectCluster], (cluster) => {
    return CLUSTERS_WITHOUT_POOL_ACL.indexOf(cluster) === -1;
});

export const selectCurrentPoolPath = createSelector(
    [selectPool, selectPools, selectTree],
    (pool, pools, tree) => {
        return calculatePoolPath(pool, pools, tree);
    },
);

export function calculatePoolPath(
    pool: string,
    pools: Array<{name: string; parent?: string}>,
    tree: string,
) {
    const prefix = `//sys/pool_trees/${tree}`;

    let current = pool;
    const path = [];
    while (current) {
        if (current !== ROOT_POOL_NAME) {
            path.push(current);
        }
        const tmp = current;
        const {parent} = find_(pools, ({name}) => name === tmp) || {};
        current = parent || '';
    }
    const pathStr = !path.length ? '' : '/' + path.reverse().join('/');
    return `${prefix}${pathStr}`;
}

export const selectSchedulingTopPoolOfEditItem = createSelector(
    [selectSchedulingEditItem, selectSchedulingPoolsMapByName],
    (pool, mapOfPools) => {
        if (isAbcPoolName(pool?.name)) {
            return undefined;
        }

        if (isTopLevelPool(pool)) {
            return pool;
        }

        let item = pool;
        while (item) {
            const parent = mapOfPools[item.parent!];
            if (isAbcPoolName(item.parent)) {
                return item;
            }

            if (isTopLevelPool(item)) {
                return item;
            }

            item = parent;
        }
        return undefined;
    },
);

export const selectSchedulingSourcesOfEditItem = createSelector(
    [selectSchedulingEditItem, selectSchedulingTopPoolOfEditItem, selectSchedulingPoolsMapByName],
    (pool, topPool, mapOfPools): Array<string> => {
        if (!pool?.name || !mapOfPools || !topPool) {
            return [];
        }

        const res: Array<string> = [];
        visitTreeItems<{name: string}>(
            topPool,
            (item) => {
                if (pool.name !== item.name) {
                    res.push(item.name);
                }
            },
            {
                isNeedToSkipChildren: (item) => {
                    return item?.name === pool?.name;
                },
            },
        );

        return res;
    },
);

export const selectSchedulingSourcesOfEditItemSkipParent = createSelector(
    [selectSchedulingEditItem, selectSchedulingSourcesOfEditItem],
    (pool, sources) => {
        if (!pool?.parent) {
            return sources;
        }

        return filter_(sources, (item) => item !== pool.parent);
    },
);
