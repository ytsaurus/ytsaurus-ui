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
import {getSchedulingPoolsMapByName} from '../../selectors/scheduling/scheduling-pools';
import {EMPTY_OBJECT} from '../../../constants/empty';

type ExpandedPoolsThunkAction = ThunkAction<any, RootState, any, ExpandedPoolsAction>;

let loadCanceler: undefined | {cancel: (msg: string) => void};
function saveCancellation(canceler?: {cancel: (msg: string) => void}) {
    loadCanceler?.cancel('another request started');
    loadCanceler = canceler;
}

export function loadExpandedPools(tree: string): ExpandedPoolsThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        let requests = [];
        if (getExpandedPoolsLoadAll(state)) {
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
            requests.push({
                command: 'get' as const,
                parameters: {path: `${prefix}/${ROOT_POOL_NAME}`},
            });
        }

        if (!requests.length) {
            saveCancellation();

            return dispatch({
                type: SCHEDULING_EXPANDED_POOLS_SUCCESS,
                data: {rawOperations: EMPTY_OBJECT, rawOperationsTree: tree},
            });
        }

        dispatch({type: SCHEDULING_EXPANDED_POOLS_REQUEST});
        return ytApiV3Id
            .executeBatch(YTApiId.schedulingLoadOperationsPerPool, {
                parameters: {requests},
                cancellation: saveCancellation,
            })
            .then((batchRestuls) => {
                const {error, results} = splitBatchResults(
                    batchRestuls,
                    "Failed to load some pools' operations",
                );
                const rawOperations = _.reduce(
                    results,
                    (acc, data) => {
                        return Object.assign(acc, data);
                    },
                    {},
                );

                dispatch({
                    type: SCHEDULING_EXPANDED_POOLS_SUCCESS,
                    data: {rawOperations, rawOperationsTree: tree},
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
