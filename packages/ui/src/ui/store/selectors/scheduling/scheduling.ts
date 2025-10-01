import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import hammer from '../../../common/hammer';
import {createSelector} from 'reselect';
import {getCluster} from '../../../store/selectors/global';

import {prepareResources} from '../../../utils/scheduling/overview';
import {childTableItems} from '../../../utils/scheduling/detailsTable';
import {poolsTableItems} from '../../../utils/scheduling/overviewTable';
import {FIELD_AUTO} from '../../../constants/tables';
import {
    ROOT_POOL_NAME,
    SCHEDULING_POOL_CHILDREN_TABLE_ID,
    SCHEDULING_POOL_TREE_TABLE_ID,
} from '../../../constants/scheduling';

import {OldSortState} from '../../../types';

import {
    OperationInfo,
    PoolInfo,
    getPools as getPoolsImpl,
    getSchedulingPoolsMapByName,
} from './scheduling-pools';
import {RootState} from '../../../store/reducers';
import {isAbcPoolName, isTopLevelPool} from '../../../utils/scheduling/pool';
import {PoolOrOperation, PoolTreeNode} from '../../../utils/scheduling/pool-child';
import {visitTreeItems} from '../../../utils/utils';
import {getExpandedPoolsLoadAll, getSchedulingOperationsExpandedPools} from './expanded-pools';
import {
    getSchedulingAttributesToFilter,
    getSchedulingFilteredPoolNames,
} from './attributes-to-filter';

export const getPools = getPoolsImpl;

const getExpandedPoolsIsInitialLoading = (state: RootState) => {
    const {loaded, loading} = state.scheduling.expandedPools;
    return !loaded && loading;
};

export const getSchedulingIsInitialLoading = (state: RootState) => {
    const {loaded, loading} = state.scheduling.scheduling;
    return (!loaded && loading) || getExpandedPoolsIsInitialLoading(state);
};

export const getTreeResources = (state: RootState) => state.scheduling.scheduling.treeResources;
export const getPoolChildrenFilter = (state: RootState) =>
    state.scheduling.scheduling.poolChildrenFilter;
export const getSchedulingTreeState = (state: RootState) => state.scheduling.scheduling.treeState;
const getContentModeRaw = (state: RootState) => state.scheduling.scheduling.contentMode;

export const getTree = (state: RootState) => state.scheduling.scheduling.tree;
export const getTrees = (state: RootState) => state.scheduling.scheduling.trees;

export const getPool = (state: RootState) => state.scheduling.scheduling.pool;

export const getSchedulingEditItem = (state: RootState) => state.scheduling.scheduling.editItem;

export const getCurrentPool = createSelector([getPool, getPools], (pool, pools) => {
    const res = find_(pools, (item) => item.name === pool);
    return res;
});

const getSortStateRaw = (state: RootState) => state.tables[SCHEDULING_POOL_TREE_TABLE_ID];
export const getSortState = createSelector([getSortStateRaw, getCurrentPool], schedulingSortState);

const getPoolChildrenSortStateRaw = (state: RootState) =>
    state.tables[SCHEDULING_POOL_CHILDREN_TABLE_ID];

export const getPoolChildrenSortState = createSelector(
    [getPoolChildrenSortStateRaw, getCurrentPool],
    schedulingSortState,
);

function schedulingSortState(sortState: OldSortState, pool?: {mode?: 'fifo' | string}) {
    const {field, asc} = sortState;
    if (field !== FIELD_AUTO) {
        return sortState;
    }

    return pool?.mode === 'fifo' ? {field: 'FI', asc} : {field: 'name', asc};
}

export const getPoolsNames = createSelector(
    getSchedulingAttributesToFilter,
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

export const getSchedulingContentMode = createSelector([getContentModeRaw], (mode) => {
    const index = SCHEDULING_CONTENT_MODES.indexOf(mode as any);
    return SCHEDULING_CONTENT_MODES[index !== -1 ? index : 0];
});

export const getIsRoot = createSelector(getPool, (pool) => pool === ROOT_POOL_NAME);

export const getTreesSelectItems = createSelector(getTrees, (trees) =>
    map_(trees, (tree) => ({
        value: tree,
        content: hammer.format['Readable'](tree) as string,
    })),
);

export const getPoolsSelectItems = createSelector(getPoolsNames, (pools) => {
    const items = map_(pools, (pool) => ({
        value: pool,
        content: pool,
    }));

    return items;
});

export const getPoolIsEphemeral = createSelector([getCurrentPool], (currentPool) => {
    if (currentPool && currentPool.isEphemeral !== undefined) return currentPool.isEphemeral;
    return undefined;
});

export const getCurrentPoolChildren = createSelector(getCurrentPool, (currentPool) => {
    if (currentPool) {
        return currentPool.children;
    }

    return undefined;
});

export const getCurrentPoolOperations = createSelector(getCurrentPool, (currentPool) => {
    if (currentPool) {
        return currentPool.leaves;
    }

    return undefined;
});

export const getResources = createSelector(
    [getCurrentPool, getTreeResources],
    (currentPool, resources) => {
        if (currentPool && currentPool.name !== '<Root>') {
            return prepareResources(currentPool.attributes);
        } else if (resources) {
            return prepareResources(resources);
        }

        return [];
    },
);

const getFilteredTree = createSelector(
    [getCurrentPool, getSchedulingFilteredPoolNames],
    (treeRoot, visiblePools) => {
        if (treeRoot) {
            return hammer.treeList.filterTree(
                treeRoot,
                (pool: {name: string}) => {
                    return visiblePools === undefined || visiblePools.has(pool.name);
                },
                true,
            );
        }
        return undefined;
    },
);

export const getTableItems = createSelector(
    [getFilteredTree, getSortState],
    (filteredTree, sortState) => {
        if (filteredTree) {
            const isRoot = filteredTree && filteredTree.name === ROOT_POOL_NAME;
            const tree = isRoot ? filteredTree : {children: [filteredTree]};
            const sortedTree = hammer.treeList.sortTree(tree, sortState, poolsTableItems);

            return hammer.treeList.flattenTree(sortedTree);
        }

        return [];
    },
);

export const getSchedulingOverviewMaxDepth = createSelector(
    [getTableItems, getExpandedPoolsLoadAll, getTree, getSchedulingOperationsExpandedPools],
    (items: Array<{level: number; name: string}>, allExpanded, tree, expandedPoolsMap) => {
        if (allExpanded) {
            return reduce_(
                items,
                (acc, item) => {
                    const {level = 0} = item || {};
                    return acc < level ? level : acc;
                },
                0,
            );
        }

        const expandedPools = expandedPoolsMap[tree];
        if (!expandedPools?.size) {
            return 0;
        }

        return reduce_(
            items,
            (acc, item) => {
                if (expandedPools.has(item.name)) {
                    return acc < item.level + 1 ? item.level + 1 : acc;
                }
                return acc;
            },
            0,
        );
    },
);

const getPoolChildrenData = createSelector(
    [getCurrentPool, getCurrentPoolChildren, getCurrentPoolOperations],
    (pool, pools, operations = []): undefined | Array<PoolOrOperation<'pool' | 'operation'>> => {
        if (pool && pools) {
            return [...pools, ...operations];
        }

        return undefined;
    },
);

const getFilteredPoolChildren = createSelector(
    [getPoolChildrenData, getPoolChildrenFilter],
    (poolChildrenData, poolChildrenFilter): typeof poolChildrenData => {
        return hammer.filter.filter({
            data: poolChildrenData,
            input: poolChildrenFilter,
            factors: ['name'],
        });
    },
);

export const getSortedPoolChildren = createSelector(
    [getFilteredPoolChildren, getPoolChildrenSortState, getCurrentPool],
    (filteredPoolChildren, poolChildrenSortState, currentPool): typeof filteredPoolChildren => {
        return hammer.utils.sort(filteredPoolChildren, poolChildrenSortState, childTableItems, {
            addGetParams: [currentPool],
            groupBy: {
                asc: true,
                get(item: Partial<PoolInfo> | Partial<OperationInfo>) {
                    return item.type === 'operation' ? 0 : 1;
                },
            },
        }) as typeof filteredPoolChildren;
    },
);

export const getPollChildrenTableItems = createSelector(
    [getCurrentPool, getSortedPoolChildren],
    (currentPool, sortedPoolChildren) => {
        const extras = [] as Exclude<typeof sortedPoolChildren, undefined>;
        let isChildPool = false;
        if (currentPool && currentPool.name !== ROOT_POOL_NAME) {
            extras.push(currentPool);
            isChildPool = true;
        }

        return extras.concat(
            map_(sortedPoolChildren, (item) => {
                return Object.assign({}, item, {isChildPool});
            }),
        );
    },
);

// The same cluster is ready for bundle's ACL
const CLUSTERS_WITHOUT_POOL_ACL = ['locke'];

export const isPoolAclAllowed = createSelector([getCluster], (cluster) => {
    return CLUSTERS_WITHOUT_POOL_ACL.indexOf(cluster) === -1;
});

export const getCurrentPoolPath = createSelector(
    [getPool, getPools, getTree],
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

export const getSchedulingTopPoolOfEditItem = createSelector(
    [getSchedulingEditItem, getSchedulingPoolsMapByName],
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

export const getSchedulingSourcesOfEditItem = createSelector(
    [getSchedulingEditItem, getSchedulingTopPoolOfEditItem, getSchedulingPoolsMapByName],
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

export const getSchedulingSourcesOfEditItemSkipParent = createSelector(
    [getSchedulingEditItem, getSchedulingSourcesOfEditItem],
    (pool, sources) => {
        if (!pool?.parent) {
            return sources;
        }

        return filter_(sources, (item) => item !== pool.parent);
    },
);
