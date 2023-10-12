import React from 'react';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import axios from 'axios';
import _ from 'lodash';

import {Toaster} from '@gravity-ui/uikit';

import {ExpandedPoolsAction} from '../../reducers/scheduling/expanded-pools';

import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {showErrorPopup, splitBatchResults} from '../../../utils/utils';
import {
    ROOT_POOL_NAME,
    SCHEDULING_EXPANDED_POOLS_FAILURE,
    SCHEDULING_EXPANDED_POOLS_PARTITION,
    SCHEDULING_EXPANDED_POOLS_REQUEST,
    SCHEDULING_EXPANDED_POOLS_SUCCESS,
} from '../../../constants/scheduling';
import {
    calculatePoolPath,
    getCurrentPool,
    getPools,
    getTree,
} from '../../selectors/scheduling/scheduling';
import {
    getExpandedPoolsLoadAll,
    getSchedulingOperationsExpandedPools,
} from '../../selectors/scheduling/expanded-pools';
import {EMPTY_OBJECT} from '../../../constants/empty';
import {PoolInfo, getSchedulingPoolsMapByName} from '../../selectors/scheduling/scheduling-pools';
import {BatchSubRequest} from '../../../../shared/yt-types';

type ExpandedPoolsThunkAction = ThunkAction<any, RootState, any, ExpandedPoolsAction>;

let loadCanceler: undefined | {cancel: (msg: string) => void};
function saveCancellation(canceler?: {cancel: (msg: string) => void}) {
    loadCanceler?.cancel('another request started');
    loadCanceler = canceler;
}

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
];

export function loadExpandedPools(tree: string): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        const loadAll = getExpandedPoolsLoadAll(state);
        let requests: Array<BatchSubRequest> = [];
        if (loadAll) {
            requests = [
                {
                    command: 'get' as const,
                    parameters: {
                        path: `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/fair_share_info/operations`,
                    },
                },
            ];
        } else {
            const expandedPools = getSchedulingOperationsExpandedPools(state)[tree] || new Set();
            const currentPool = getCurrentPool(state)?.name;
            const pools =
                !currentPool || currentPool === ROOT_POOL_NAME || expandedPools.has(currentPool)
                    ? [...expandedPools]
                    : [currentPool, ...expandedPools];

            const prefix = `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/operations_by_pool`;
            requests = _.map(pools, (item) => {
                return {
                    command: 'get' as const,
                    parameters: {
                        path: `${prefix}/${item}`,
                    },
                };
            });
        }

        const lastOperationByPoolLenght = requests.length;

        // let pool = getPool(getState());
        // if (!pools[pool]) {
        //     pool = ROOT_POOL_NAME;
        //     dispatch({type: SCHEDULING_DATA_SUCCESS, {pool}})
        // }

        const loadAllPools = true;
        if (loadAllPools) {
            requests.push({
                command: 'get' as const,
                parameters: {
                    path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools`,
                    fields: POOL_FIELDS_TO_LOAD,
                },
            });
        } else {
            console.log('Not implemented');
        }

        if (!requests.length) {
            saveCancellation();

            return dispatch({
                type: SCHEDULING_EXPANDED_POOLS_SUCCESS,
                data: {rawOperations: EMPTY_OBJECT, expandedPoolsTree: tree},
            });
        }

        dispatch({type: SCHEDULING_EXPANDED_POOLS_REQUEST});
        return ytApiV3Id
            .executeBatch(YTApiId.schedulingLoadOperationsPerPool, {
                parameters: {requests},
                cancellation: saveCancellation,
            })
            .then((batchRestuls) => {
                const {error} = splitBatchResults(
                    batchRestuls,
                    'Failed to load some expanded pools info',
                );

                const operationsResponse = batchRestuls.slice(0, lastOperationByPoolLenght);
                const {results: operations} = splitBatchResults(operationsResponse);
                const rawOperations = _.reduce(
                    operations,
                    (acc, data) => {
                        return Object.assign(acc, data);
                    },
                    {},
                );

                const poolsResponse = batchRestuls.slice(lastOperationByPoolLenght);
                const {results: pools} = splitBatchResults<PoolInfo>(poolsResponse);
                const rawPools: Record<string, PoolInfo> = {};

                if (loadAllPools) {
                    const [value = {}] = pools ?? [];
                    Object.assign(rawPools, value);
                } else {
                    console.log('Not implemented');
                }

                dispatch({
                    type: SCHEDULING_EXPANDED_POOLS_SUCCESS,
                    data: {rawOperations, expandedPoolsTree: tree, rawPools},
                });

                if (error) {
                    throw error;
                }
            })
            .catch((error) => {
                if (!axios.isCancel(error) && (!error?.code as any) === 'cancelled') {
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

        const newExpandedPools = {
            ...expandedPools,
            [tree]: treeExpandedPools,
        };

        dispatch({
            type: SCHEDULING_EXPANDED_POOLS_PARTITION,
            data: {expandedPools: newExpandedPools},
        });

        dispatch(loadExpandedPools(tree));
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
