import React from 'react';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import _ from 'lodash';

import {Toaster} from '@gravity-ui/uikit';

import {ExpandedPoolsAction} from '../../reducers/scheduling/expanded-pools';

import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {showErrorPopup, splitBatchResults} from '../../../utils/utils';
import {makeGet} from '../../../utils/batch';
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
import {isSupportedSchedulingChildrenByPool} from '../../../store/selectors/thor/support';
import {YTError} from '../../../../@types/types';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {EMPTY_OBJECT} from '../../../constants';

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
    'estimated_burst_usage_duration_sec',
    'fair_share_ratio',
    'fifo_index',
    'integral_guarantee_type',
    'is_ephemeral',
    'max_operation_count',
    'max_running_operation_count',
    'max_share_ratio',
    'min_share_ratio',
    'mode',
    'operation_count',
    'parent',
    'pool_operation_count',
    'child_pool_count',
    'resource_demand',
    'resource_limits',
    'resource_usage',
    'promised_fair_share_resources',
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

class EmptyFullPath extends Error {}

export function loadExpandedPools(tree: string): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const pool = getPool(getState());

        if (pool === ROOT_POOL_NAME) {
            return dispatch(loadExpandedOperationsAndPools(tree));
        } else {
            return ytApiV3Id
                .executeBatch<string>(YTApiId.schedulingPoolFullPath, {
                    requests: [
                        {
                            command: 'get' as const,
                            parameters: {
                                path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools/${pool}/full_path`,
                            },
                        },
                    ],
                })
                .then(([{output: fullPath}]) => {
                    if (!fullPath) {
                        throw new EmptyFullPath();
                    } else {
                        /**
                         * `fullPath` value starts from `/`, example: `/mypool/child/subchild`
                         * so we have to use `.slice(1)` to remove first empty string
                         */
                        const expandedPools = fullPath.split('/').slice(1);
                        dispatch(addToExpandedPoolsNoLoad(tree, expandedPools));
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
                        new Toaster().add({
                            name: 'schedulingPoolFullPath',
                            type: 'error',
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
        const expandedPools = loadAll
            ? new Set<string>()
            : getSchedulingOperationsExpandedPools(state)[tree] ?? new Set<string>();

        const operationsExpandedPools = [...expandedPools];

        const operationsRequests: Array<BatchSubRequest> = [];
        if (loadAll) {
            operationsRequests.push(
                makeGet(
                    `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/fair_share_info/operations`,
                ),
            );
        } else {
            const prefix = `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/operations_by_pool`;
            operationsExpandedPools.forEach((item) => {
                operationsRequests.push(makeGet(`${prefix}/${item}`));
            });
        }

        const loadAllPools = loadAll || !isSupportedSchedulingChildrenByPool(state);
        const poolsRequests: Array<BatchSubRequest> = [];
        const poolsChildrenRequests: Array<BatchSubRequest> = [];
        const poolsExpandedPools = expandedPools.has(ROOT_POOL_NAME)
            ? [...expandedPools]
            : [ROOT_POOL_NAME, ...expandedPools];
        if (loadAllPools) {
            operationsRequests.push(
                makeGet(`//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools`, {
                    fields: POOL_FIELDS_TO_LOAD,
                }),
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
            loadAllPools
                ? ytApiV3Id.executeBatch(YTApiId.schedulingLoadPoolsAll, {
                      parameters: {requests: poolsRequests},
                      cancellation: cancelHelper.saveCancelToken,
                  })
                : ytApiV3Id.executeBatch(YTApiId.schedulingLoadPoolsPerPool, {
                      parameters: {requests: poolsRequests},
                      cancellation: cancelHelper.saveCancelToken,
                  }),
            loadAllPools
                ? Promise.resolve([])
                : ytApiV3Id.executeBatch(YTApiId.schedulingLoadChildrenPerPool, {
                      parameters: {requests: poolsChildrenRequests},
                      cancellation: cancelHelper.saveCancelToken,
                  }),
        ])
            .then(([operationsResults, poolsResults, poolsChildrenResults]) => {
                const error: YTError = {message: 'Failed to load pools'};
                const {results: operations} = splitBatchResults(operationsResults, error);
                const rawOperations = _.reduce(
                    operations,
                    (acc, data) => {
                        return Object.assign(acc, data);
                    },
                    {},
                );

                const rawPools: Record<string, PoolInfo> = {};

                if (loadAllPools) {
                    const {results: pools} = splitBatchResults<Record<string, PoolInfo>>(
                        poolsResults,
                        error,
                    );
                    const [value = {}] = pools ?? [];
                    Object.assign(rawPools, value);
                } else {
                    const {results: pools, resultIndices} = splitBatchResults<PoolInfo>(
                        poolsResults,
                        error,
                    );
                    pools.forEach((poolInfo, index) => {
                        const name = poolsExpandedPools[resultIndices[index]];
                        rawPools[name] = poolInfo;
                    });

                    const {results: poolChildren} = splitBatchResults<Record<string, PoolInfo>>(
                        poolsChildrenResults,
                        error,
                    );
                    poolChildren.forEach((children) => {
                        Object.assign(rawPools, children);
                    });
                }

                dispatch({
                    type: SCHEDULING_EXPANDED_POOLS_SUCCESS,
                    data: {
                        expandedPoolsTree: tree,
                        rawOperations: Object.keys(rawOperations).length
                            ? rawOperations
                            : EMPTY_OBJECT,
                        rawPools: Object.keys(rawPools).length ? rawPools : EMPTY_OBJECT,
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

                    const data = error?.response?.data || error;
                    const {code, message} = data;

                    new Toaster().add({
                        name: 'load-scheduling-operations',
                        type: 'error',
                        title: 'Failed to load operations',
                        content: (
                            <span>
                                [code {code}] {message}
                            </span>
                        ),
                        actions: [
                            {
                                label: ' Details',
                                onClick: () => showErrorPopup(data),
                            },
                        ],
                    });
                }
            });
    };
}

export function setExpandedPool(poolName: string, expanded: boolean): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const tree = getTree(getState());
        const expandedPools = getSchedulingOperationsExpandedPools(state);

        const treeExpandedPools = new Set(expandedPools[tree]);
        if (expanded) {
            treeExpandedPools.add(poolName);
        } else {
            treeExpandedPools.delete(poolName);
        }

        dispatch(updateExpandedPoolNoLoad(tree, treeExpandedPools));
        dispatch(loadExpandedPools(tree));
    };
}

function addToExpandedPoolsNoLoad(
    tree: string,
    poolsToExpand: Array<string>,
): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const oldExpandedPools = getSchedulingOperationsExpandedPools(getState());
        const treeExpandedPools = new Set(oldExpandedPools[tree]);

        let updated = false;
        poolsToExpand.forEach((pool) => {
            if (!treeExpandedPools.has(pool)) {
                updated = true;
                treeExpandedPools.add(pool);
            }
        });

        if (updated) {
            dispatch(updateExpandedPoolNoLoad(tree, treeExpandedPools));
        }
    };
}

function updateExpandedPoolNoLoad(
    tree: string,
    treeExpandedPools: Set<string>,
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
                        [tree]: new Set<string>(),
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
            orchidPath: `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/fair_share_info/pools/${poolName}`,
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
