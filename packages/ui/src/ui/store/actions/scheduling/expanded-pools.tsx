import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';

import forEach_ from 'lodash/forEach';
import reduce_ from 'lodash/reduce';

import {UIBatchError, splitBatchResults} from '../../../../shared/utils/error';

import {
    ExpandedPoolInfo,
    ExpandedPoolsAction,
    PoolCypressData,
} from '../../reducers/scheduling/expanded-pools';

import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {USE_IGNORE_NODE_DOES_NOT_EXIST} from '../../../utils/utils';
import {makeGet, makeList} from '../../../utils/batch';
import {
    CHANGE_POOL,
    ROOT_POOL_NAME,
    SCHEDULING_EXPANDED_POOLS_FAILURE,
    SCHEDULING_EXPANDED_POOLS_PARTITION,
    SCHEDULING_EXPANDED_POOLS_REQUEST,
    SCHEDULING_EXPANDED_POOLS_SUCCESS,
} from '../../../constants/scheduling';
import {calculatePoolPath, getPool, getPools, getTree} from '../../selectors/scheduling/scheduling';
import {
    getExpandedPoolsLoadAll,
    getSchedulingOperationsExpandedPools,
} from '../../selectors/scheduling/expanded-pools';
import {EMPTY_OBJECT} from '../../../constants/empty';
import {PoolInfo, getSchedulingPoolsMapByName} from '../../selectors/scheduling/scheduling-pools';
import {BatchSubRequest} from '../../../../shared/yt-types';
import {SchedulingAction} from '../../../store/reducers/scheduling/scheduling';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {flattenAttributes} from '../../../utils/scheduling/scheduling';
import {PoolTreeNode} from '../../../utils/scheduling/pool-child';

import {toaster} from '../../../utils/toaster';

type ExpandedPoolsThunkAction = ThunkAction<
    any,
    RootState,
    any,
    ExpandedPoolsAction | SchedulingAction
>;

const cancelHelper = new CancelHelper();

const POOL_FIELDS_TO_LOAD = [
    'accumulated_resource_ratio_volume',
    'accumulated_resource_volume',
    'demand_ratio',
    'detailed_fair_share',
    'dominant_resource',
    'effective_lightweight_operations_enabled',
    'estimated_burst_usage_duration_sec',
    'fair_share_ratio',
    'fifo_index',
    'fifo_sort_parameters',
    'integral_guarantee_type',
    'integral_pool_capacity',
    'is_ephemeral',
    'max_operation_count',
    'max_running_operation_count',
    'lightweight_running_operation_count',
    'max_share_ratio',
    'min_share_ratio',
    'mode',
    'operation_count',
    'parent',
    'pool_operation_count',
    'child_pool_count',
    'resource_demand',
    'resource_limits',
    'specified_resource_limits',
    'resource_usage',
    'estimated_guarantee_resources',
    'effective_strong_guarantee_resources',
    'running_operation_count',
    'specified_burst_guarantee_resources',
    'specified_resource_flow',
    'starvation_status',
    'starving',
    'strong_guarantee_resources',
    'usage_ratio',
    'weight',
    'abc',
];

const POOL_TREE_GET_ATTRS = [
    'integral_guarantees',
    'weight',
    'max_operation_count',
    'max_running_operation_count',
    'strong_guarantee_resources',
    'resource_limits',
    'specified_resource_limits',
    'forbid_immediate_operations',
    'create_ephemeral_subpools',
    'fifo_sort_parameters',
    'config',
    'folder_id',
];

class EmptyFullPath extends Error {}

export function loadExpandedPools(tree: string): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const pool = getPool(getState());

        if (!tree) {
            return undefined;
        }

        if (pool === ROOT_POOL_NAME) {
            return dispatch(loadExpandedOperationsAndPools(tree));
        } else {
            return ytApiV3Id
                .executeBatch<{full_path: string; is_ephemeral?: boolean}>(
                    YTApiId.schedulingPoolFullPath,
                    {
                        requests: [
                            {
                                command: 'get' as const,
                                parameters: {
                                    path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools/${pool}`,
                                    fields: ['is_ephemeral', 'full_path'],
                                },
                            },
                        ],
                    },
                )
                .then(([{output}]) => {
                    const {full_path, is_ephemeral} = output ?? {};
                    if (!full_path) {
                        throw new EmptyFullPath();
                    } else {
                        dispatch(addFullPathToExpandedPoolsNoLoad(tree, full_path, is_ephemeral));
                        dispatch(loadExpandedOperationsAndPools(tree));
                    }
                })
                .catch((e) => {
                    if (e instanceof EmptyFullPath) {
                        dispatch({type: CHANGE_POOL, data: {pool: ROOT_POOL_NAME}});
                        /**
                         * We don't need to call `dispatch(loadExpandedOperationsAndPools(tree))` after `CHANGE_POOL`.
                         * The call will be triggered by SchedulingExpandedPoolsUpdater.
                         */
                        // dispatch(loadExpandedOperationsAndPools(tree));
                    } else {
                        toaster.add({
                            name: 'schedulingPoolFullPath',
                            theme: 'danger',
                            title: '',
                        });
                    }
                });
        }
    };
}

function loadExpandedOperationsAndPools(tree: string): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        const loadAll = getExpandedPoolsLoadAll(state);
        const expandedPools: Map<string, ExpandedPoolInfo> = loadAll
            ? new Map()
            : (getSchedulingOperationsExpandedPools(state)[tree] ?? new Map());
        const expandedPoolNames: Array<string> = [...expandedPools.keys()];

        const operationsExpandedPools: Array<string> = [...expandedPoolNames];

        const operationsRequests: Array<BatchSubRequest> = [];
        if (loadAll) {
            operationsRequests.push(
                makeGet(`//sys/scheduler/orchid/scheduler/pool_trees/${tree}/operations`),
            );
        } else {
            const prefix = `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/operations_by_pool`;
            operationsExpandedPools.forEach((item) => {
                operationsRequests.push(makeGet(`${prefix}/${item}`));
            });
        }

        const loadAllPools = loadAll;
        const poolsRequests: Array<BatchSubRequest> = [];
        const poolsChildrenRequests: Array<BatchSubRequest> = [];
        const poolsCypressDataRequests: Array<BatchSubRequest> = [];

        const poolsExpandedPools: Array<string> = [ROOT_POOL_NAME, ...expandedPoolNames];

        if (loadAllPools) {
            poolsRequests.push(
                makeGet(`//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools`, {
                    fields: POOL_FIELDS_TO_LOAD,
                }),
            );
            poolsCypressDataRequests.push(
                makeGet(`//sys/pool_trees/${tree}`, {attributes: POOL_TREE_GET_ATTRS}),
            );
        } else {
            poolsExpandedPools.forEach((pool) => {
                poolsRequests.push(
                    makeGet(`//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools/${pool}`, {
                        fields: POOL_FIELDS_TO_LOAD,
                    }),
                );
                poolsChildrenRequests.push(
                    makeGet(
                        `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/child_pools_by_pool/${pool}`,
                        {
                            fields: POOL_FIELDS_TO_LOAD,
                        },
                    ),
                );
                const {parentPoolPath, isEphemeral} = expandedPools.get(pool) ?? {};
                const cypressDataPath = parentPoolPath
                    ? `//sys/pool_trees/${tree}/${parentPoolPath}/${pool}`
                    : `//sys/pool_trees/${tree}/${pool}`;
                if (pool === ROOT_POOL_NAME || !isEphemeral) {
                    poolsCypressDataRequests.push(
                        makeList(
                            pool === ROOT_POOL_NAME ? `//sys/pool_trees/${tree}` : cypressDataPath,
                            {
                                attributes: POOL_TREE_GET_ATTRS,
                            },
                        ),
                    );
                }
            });
        }

        cancelHelper.removeAllRequests();

        dispatch({type: SCHEDULING_EXPANDED_POOLS_REQUEST});
        return Promise.all([
            operationsRequests.length
                ? ytApiV3Id.executeBatch(YTApiId.schedulingLoadOperationsPerPool, {
                      parameters: {requests: operationsRequests},
                      cancellation: cancelHelper.saveCancelToken,
                  })
                : Promise.resolve([]),

            ytApiV3Id.executeBatch(
                loadAllPools ? YTApiId.schedulingLoadPoolsAll : YTApiId.schedulingLoadPoolsPerPool,
                {
                    parameters: {requests: poolsRequests},
                    cancellation: cancelHelper.saveCancelToken,
                },
            ),
            loadAllPools
                ? Promise.resolve([])
                : ytApiV3Id.executeBatch(YTApiId.schedulingLoadChildrenPerPool, {
                      parameters: {requests: poolsChildrenRequests},
                      cancellation: cancelHelper.saveCancelToken,
                  }),
            !poolsCypressDataRequests.length
                ? Promise.resolve([])
                : ytApiV3Id.executeBatch(YTApiId.schedulingLoadCypressDataPerPool, {
                      parameters: {requests: poolsCypressDataRequests},
                      cancellation: cancelHelper.saveCancelToken,
                  }),
        ])
            .then(([operationsResults, poolsResults, poolsChildrenResults, poolsCypressData]) => {
                const error = new UIBatchError('Failed to load expanded pools');
                const {results: operations, errorIgnoredIndices} = splitBatchResults(
                    operationsResults,
                    error,
                    USE_IGNORE_NODE_DOES_NOT_EXIST,
                );
                const rawOperations = reduce_(
                    operations,
                    (acc, data) => {
                        return Object.assign(acc, data);
                    },
                    {},
                );

                const poolsToCollapse: Record<string, false> = {};
                forEach_(errorIgnoredIndices, (pos) => {
                    poolsToCollapse[operationsExpandedPools[pos]] = false;
                });

                const rawPools: Record<string, PoolInfo> = {};
                const cypressData: Record<string, PoolCypressData> = {};

                if (loadAllPools) {
                    const {results: pools} = splitBatchResults<Record<string, PoolInfo>>(
                        poolsResults,
                        error,
                    );
                    const [value = {}] = pools ?? [];
                    Object.assign(rawPools, value);

                    const {
                        results: [data],
                    } = splitBatchResults(poolsCypressData, error);
                    Object.assign(cypressData, flattenAttributes(data));
                } else {
                    const {
                        results: pools,
                        resultIndices,
                        errorIgnoredIndices: poolsReqeustsIgnored,
                    } = splitBatchResults<PoolInfo>(
                        poolsResults,
                        error,
                        USE_IGNORE_NODE_DOES_NOT_EXIST,
                    );
                    pools.forEach((poolInfo, index) => {
                        const name = poolsExpandedPools[resultIndices[index]];
                        rawPools[name] = poolInfo;
                    });

                    const {
                        results: poolChildren,
                        errorIgnoredIndices: poolsChildrenRequestsIgnored,
                    } = splitBatchResults<Record<string, PoolInfo>>(
                        poolsChildrenResults,
                        error,
                        USE_IGNORE_NODE_DOES_NOT_EXIST,
                    );
                    poolChildren.forEach((children) => {
                        Object.assign(rawPools, children);
                    });

                    const {
                        results: cypressDataChildrenPerPool,
                        errorIgnoredIndices: poolsCypressDataRequestsIgnored,
                    } = splitBatchResults<Array<PoolCypressData>>(
                        poolsCypressData,
                        error,
                        USE_IGNORE_NODE_DOES_NOT_EXIST,
                    );
                    cypressDataChildrenPerPool.forEach((poolChildrenCypressData) => {
                        poolChildrenCypressData.forEach((item) => {
                            cypressData[item.$value] = item;
                        });
                    });

                    forEach_(
                        [
                            ...poolsReqeustsIgnored,
                            ...poolsChildrenRequestsIgnored,
                            ...poolsCypressDataRequestsIgnored,
                        ],
                        (position) => {
                            const poolName = poolsExpandedPools[position];
                            poolsToCollapse[poolName] = false;
                        },
                    );
                    setExpandedPools(poolsToCollapse);
                }

                const poolNames = Object.keys(rawPools).sort();

                dispatch({
                    type: SCHEDULING_EXPANDED_POOLS_SUCCESS,
                    data: {
                        expandedPoolsTree: tree,
                        rawOperations: Object.keys(rawOperations).length
                            ? rawOperations
                            : EMPTY_OBJECT,
                        rawPools: poolNames.length
                            ? poolNames.reduce(
                                  (acc, key) => {
                                      acc[key] = rawPools[key];
                                      return acc;
                                  },
                                  {} as typeof rawPools,
                              )
                            : EMPTY_OBJECT,
                        flattenCypressData: Object.keys(cypressData).length
                            ? cypressData
                            : EMPTY_OBJECT,
                    },
                });

                if (error.inner_errors?.length) {
                    throw error;
                }
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch({
                        type: SCHEDULING_EXPANDED_POOLS_FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function setExpandedPools(changes: Record<string, boolean>): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const tree = getTree(getState());
        const expandedPools = getSchedulingOperationsExpandedPools(state);

        const poolsByName = getSchedulingPoolsMapByName(state);

        const treeExpandedPools = new Map(expandedPools[tree]);
        forEach_(changes, (expanded, poolName) => {
            if (expanded) {
                const expandedPoolInfo = calcExpandedPoolInfo(poolName, poolsByName);
                treeExpandedPools.set(poolName, expandedPoolInfo);
            } else {
                treeExpandedPools.delete(poolName);
            }
        });

        dispatch(updateExpandedPoolNoLoad(tree, treeExpandedPools));
        dispatch(loadExpandedPools(tree));
    };
}

function addFullPathToExpandedPoolsNoLoad(
    tree: string,
    /**
     * elements of the array should have the same format as `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools/${pool}/full_path`
     */
    fullPath: string,
    isEphemeral?: boolean,
): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const oldExpandedPools = getSchedulingOperationsExpandedPools(state);
        const treeExpandedPools = new Map(oldExpandedPools[tree]);

        /**
         * `fullPath` value starts from `/`, example: `/mypool/child/subchild`
         * so we have to use `.slice(1)` to remove first empty string
         */
        const parts = fullPath.split('/').slice(1);

        for (let i = 0; i < parts.length; ++i) {
            const poolName = parts[i];
            const parentPoolPath = parts.slice(0, i).join('/');
            treeExpandedPools.set(poolName, {parentPoolPath, isEphemeral});
        }

        dispatch(updateExpandedPoolNoLoad(tree, treeExpandedPools));
    };
}

function updateExpandedPoolNoLoad(
    tree: string,
    treeExpandedPools: Map<string, ExpandedPoolInfo>,
): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const oldExpandedPools = getSchedulingOperationsExpandedPools(getState());

        const expandedPools = {
            ...oldExpandedPools,
            [tree]: treeExpandedPools,
        };

        dispatch({
            type: SCHEDULING_EXPANDED_POOLS_PARTITION,
            data: {expandedPools},
        });
    };
}

export function resetExpandedPools(tree: string): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        if (!tree) {
            return;
        }

        const state = getState();
        const {[tree]: old, ...rest} = getSchedulingOperationsExpandedPools(state);

        if (old?.size) {
            dispatch({
                type: SCHEDULING_EXPANDED_POOLS_PARTITION,
                data: {
                    expandedPools: {
                        ...rest,
                        [tree]: new Map<string, ExpandedPoolInfo>(),
                    },
                },
            });
        }
    };
}

export function getSchedulingOperationsCount(): ThunkAction<number, RootState, any, any> {
    return (_dispatch, getState) => {
        const state = getState();

        const tree = getSchedulingPoolsMapByName(state);
        const root = tree[ROOT_POOL_NAME];
        return root?.operationCount || 0;
    };
}

export function getPoolPathsByName(
    poolName: string,
): ThunkAction<{fullPath: string; orchidPath: string}, RootState, unknown, any> {
    return (_dispatch, getState) => {
        const state = getState();
        const pools = getPools(state);
        const tree = getTree(state);

        return {
            fullPath: calculatePoolPath(poolName, pools, tree),
            orchidPath: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools/${poolName}`,
        };
    };
}

export function setLoadAllOperations(loadAll: boolean): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        dispatch({
            type: SCHEDULING_EXPANDED_POOLS_PARTITION,
            data: {loadAll},
        });

        const tree = getTree(state);
        dispatch(loadExpandedPools(tree));
    };
}

function calcExpandedPoolInfo(
    poolName: string,
    poolsByName: Record<string, PoolTreeNode>,
): ExpandedPoolInfo {
    let data = poolsByName[poolName];
    const isEphemeral = data?.isEphemeral;
    let res = '';
    while (data?.parent && data.parent !== ROOT_POOL_NAME) {
        res = res ? `${data.parent}/${res}` : data.parent;
        data = poolsByName[data.parent];
    }
    return {parentPoolPath: res, isEphemeral};
}
