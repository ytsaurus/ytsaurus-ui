import React from 'react';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import axios from 'axios';
import _ from 'lodash';

import {Toaster} from '@gravity-ui/uikit';

import {SchedulingOperationsAction} from '../../../store/reducers/scheduling/scheduling-operations';

import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {showErrorPopup, splitBatchResults} from '../../../utils/utils';
import {
    ROOT_POOL_NAME,
    SCHEDULING_OPERATIONS_FAILURE,
    SCHEDULING_OPERATIONS_PARTITION,
    SCHEDULING_OPERATIONS_REQUEST,
    SCHEDULING_OPERATIONS_SUCCESS,
} from '../../../constants/scheduling';
import {
    calculatePoolPath,
    getCurrentPool,
    getPools,
    getTree,
} from '../../selectors/scheduling/scheduling';
import {
    getSchedulingOperationsExpandedPools,
    getSchedulingOperationsLoadAll,
} from '../../selectors/scheduling/scheduling-operations';
import {getSchedulingPoolsMapByName} from '../../selectors/scheduling/scheduling-pools';
import {EMPTY_OBJECT} from '../../../constants/empty';

type SchedulingOperationsThunkAction = ThunkAction<any, RootState, any, SchedulingOperationsAction>;

let loadCanceler: undefined | {cancel: (msg: string) => void};
function saveCancellation(canceler?: {cancel: (msg: string) => void}) {
    loadCanceler?.cancel('another request started');
    loadCanceler = canceler;
}

export function loadSchedulingOperationsPerPool(tree: string): SchedulingOperationsThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        let requests = [];
        if (getSchedulingOperationsLoadAll(state)) {
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
                type: SCHEDULING_OPERATIONS_SUCCESS,
                data: {rawOperations: EMPTY_OBJECT, rawOperationsTree: tree},
            });
        }

        dispatch({type: SCHEDULING_OPERATIONS_REQUEST});
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
                    type: SCHEDULING_OPERATIONS_SUCCESS,
                    data: {rawOperations, rawOperationsTree: tree},
                });

                if (error) {
                    throw error;
                }
            })
            .catch((error) => {
                if (!axios.isCancel(error) && (!error?.code as any) === 'cancelled') {
                    dispatch({
                        type: SCHEDULING_OPERATIONS_FAILURE,
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

export function setExpandedPool(
    poolName: string,
    expanded: boolean,
): SchedulingOperationsThunkAction {
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
            type: SCHEDULING_OPERATIONS_PARTITION,
            data: {expandedPools: newExpandedPools},
        });

        dispatch(loadSchedulingOperationsPerPool(tree));
    };
}

export function resetExpandedPools(tree: string): SchedulingOperationsThunkAction {
    return (dispatch, getState) => {
        if (!tree) {
            return;
        }

        const state = getState();
        const {[tree]: old, ...rest} = getSchedulingOperationsExpandedPools(state);

        if (old?.size) {
            dispatch({
                type: SCHEDULING_OPERATIONS_PARTITION,
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

export function setLoadAllOperations(loadAllOperations: boolean): SchedulingOperationsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        dispatch({
            type: SCHEDULING_OPERATIONS_PARTITION,
            data: {loadAllOperations},
        });

        const tree = getTree(state);
        dispatch(loadSchedulingOperationsPerPool(tree));
    };
}
