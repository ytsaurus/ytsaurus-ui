import forEach_ from 'lodash/forEach';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import update_ from 'lodash/update';

import {getBatchError, splitBatchResults} from '../../../../shared/utils/error';

import {
    INTEGRAL_GUARANTEES_PREFIX,
    InitialPoolResourceInfo,
    POOL_RESOURCE_TYPE_TO_ATTRIBUTE,
    PoolResourceType,
    computePoolPath,
    prepareCurrentTree,
    prepareTrees,
} from '../../../utils/scheduling/scheduling';
import {extractBatchV4Values, wrapApiPromiseByToaster} from '../../../utils/utils';
import {makeGet, makeList} from '../../../utils/batch';
import {updateNodeAttributes} from '../../../utils/cypress-attributes';

import {ThunkAction} from 'redux-thunk';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {
    getPools,
    getSchedulingIsInitialLoading,
    getTree,
} from '../../../store/selectors/scheduling/scheduling';

import {
    POOL_TOGGLE_DELETE_VISIBILITY,
    SCHEDULING_DATA_FAILURE,
    SCHEDULING_DATA_PARTITION,
    SCHEDULING_DATA_REQUEST,
    SCHEDULING_DATA_SUCCESS,
    SCHEDULING_DELETE_POOL_FAILURE,
    SCHEDULING_DELETE_POOL_REQUEST,
    SCHEDULING_DELETE_POOL_SUCCESS,
} from '../../../constants/scheduling';
import {loadExpandedPools} from './expanded-pools';
import {RumWrapper, YTApiId, ytApiV3Id, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {getCluster} from '../../../store/selectors/global';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import type {RootState} from '../../../store/reducers';
import type {SchedulingAction} from '../../../store/reducers/scheduling/scheduling';
import {
    getSchedulingAttributesToFilterParams,
    schedulingOverviewHasFilter,
} from '../../../store/selectors/scheduling/attributes-to-filter';
import {USE_CACHE} from '../../../../shared/constants/yt-api';
import {toaster} from '../../../utils/toaster';

import {PoolTreeNode} from '../../../utils/scheduling/pool-child';

type SchedulingThunkAction<T = unknown> = ThunkAction<T, RootState, unknown, SchedulingAction>;

export function loadSchedulingData(): SchedulingThunkAction {
    return (dispatch, getState) => {
        dispatch({type: SCHEDULING_DATA_REQUEST});

        const state = getState();
        const isInitialLoading = getSchedulingIsInitialLoading(state);

        const cluster = getCluster(state);
        const rumId = new RumWrapper(cluster, RumMeasureTypes.SCHEDULING);
        return rumId
            .fetch(
                YTApiId.schedulingData,
                ytApiV3Id.executeBatch(YTApiId.schedulingData, {
                    requests: [
                        makeGet('//sys/scheduler/@alerts'),
                        makeList('//sys/scheduler/orchid/scheduler/pool_trees'),
                        makeGet('//sys/scheduler/orchid/scheduler/default_pool_tree'),
                    ],
                    ...USE_CACHE,
                }),
            )
            .then((data) => {
                const {
                    error,
                    results: [schedulerAlerts, rawTrees, defaultTree],
                } = splitBatchResults(data, 'Failed to fetch scheduling data');

                if (error) {
                    return Promise.reject(error);
                }

                const state = getState();

                const trees = prepareTrees(rawTrees);
                const tree = prepareCurrentTree(
                    defaultTree,
                    trees,
                    state.scheduling.scheduling.tree,
                );

                if (isInitialLoading) {
                    dispatch(schedulingLoadFilterAttributes(tree, {checkFilters: true}));
                }

                dispatch({
                    type: SCHEDULING_DATA_PARTITION,
                    data: {schedulerAlerts, trees, tree},
                });

                const treeRequests = [
                    makeGet(`//sys/scheduler/orchid/scheduler/pool_trees/${tree}/resource_usage`),
                    makeGet(`//sys/scheduler/orchid/scheduler/pool_trees/${tree}/resource_limits`),
                    makeGet(`//sys/scheduler/orchid/scheduler/pool_trees/${tree}/config`),
                    makeGet(
                        `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/resource_distribution_info`,
                    ),
                ];

                if (isInitialLoading) {
                    /**
                     * We don't need to call `dispatch(loadExpandedPools(tree))` for this branch of code,
                     * the call should be triggered by SchedulingExpandedPoolsUpdater
                     */
                    //dispatch(loadExpandedPools(tree));
                } else {
                    dispatch(loadExpandedPools(tree));
                }

                return rumId
                    .fetch(
                        YTApiId.schedulingLoadTree,
                        ytApiV4Id.executeBatch(YTApiId.schedulingLoadTree, {
                            requests: treeRequests,
                            ...USE_CACHE,
                        }),
                    )
                    .then((treeData) => {
                        const extracted = extractBatchV4Values(treeData, treeRequests);
                        const {error, results} = splitBatchResults(
                            extracted.results,
                            'Failed to fetch tree details',
                        );
                        if (error) {
                            throw error;
                        }
                        return results;
                    });
            })
            .then(([resource_usage, resource_limits, config, resource_distribution_info]) => {
                const treeResources = {
                    resource_usage,
                    resource_limits,
                    config,
                    resource_distribution_info,
                };

                dispatch({
                    type: SCHEDULING_DATA_SUCCESS,
                    data: {
                        treeResources,
                    },
                });
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: SCHEDULING_DATA_FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function deletePool(item?: {name: string; parent?: string}): SchedulingThunkAction {
    return (dispatch, getState) => {
        if (!item) {
            return;
        }

        const state = getState();

        const tree = getTree(state);
        const pools = getPools(state);
        const path = computePoolPath(item, pools);

        dispatch({type: SCHEDULING_DELETE_POOL_REQUEST});

        return yt.v3
            .remove({
                path: `//sys/pool_trees/${tree}/${path}`,
            })
            .then(() => {
                toaster.add({
                    name: 'delete pool',
                    autoHiding: 10000,
                    theme: 'success',
                    title: `Successfully deleted ${item.name}. Please wait.`,
                });

                dispatch({type: SCHEDULING_DELETE_POOL_SUCCESS});
                dispatch(closePoolDeleteModal());
                setTimeout(() => dispatch(loadSchedulingData()), 3000);
            })
            .catch((error: any) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: SCHEDULING_DELETE_POOL_FAILURE,
                        data: {error},
                    });

                    return Promise.reject(error);
                }
                return null;
            });
    };
}

export function openPoolDeleteModal(item: PoolTreeNode): SchedulingAction {
    return {
        type: POOL_TOGGLE_DELETE_VISIBILITY,
        data: {
            visibility: true,
            item,
        },
    };
}

export function closePoolDeleteModal(): SchedulingAction {
    return {
        type: POOL_TOGGLE_DELETE_VISIBILITY,
        data: {
            visibility: false,
            item: undefined,
        },
    };
}

type PoolResources = Partial<
    Record<Exclude<PoolResourceType, 'guaranteeType'>, InitialPoolResourceInfo>
>;

interface SetResourceGuaranteeParams {
    poolPath: string;
    values: PoolResources & {guaranteeType?: string};
    initials: PoolResources;
    tree: string;
}

export function setPoolAttributes(params: SetResourceGuaranteeParams) {
    const {poolPath, values, initials, tree} = params;
    if (isEmpty_(values)) {
        return Promise.resolve();
    }

    const transferData: Array<{diff: number; source: string; path: string}> = [];
    const toModify: Array<{attr: string; value: any}> = [];

    const {guaranteeType, ...restValues} = values;

    forEach_(restValues, (v, k) => {
        const {limit, source} = v || {};
        const key = k as keyof typeof restValues;

        const attr = POOL_RESOURCE_TYPE_TO_ATTRIBUTE[key];
        if (!source || limit === undefined) {
            toModify.push({attr, value: limit});
        } else {
            const prevLimit = initials[key]?.limit || 0;
            const diff = (limit || 0) - prevLimit;
            if (diff) {
                transferData.push({diff, source, path: attr});
            }
        }
    });

    if (Object.hasOwnProperty.call(values, 'guaranteeType')) {
        toModify.push({
            attr: POOL_RESOURCE_TYPE_TO_ATTRIBUTE['guaranteeType'],
            value: guaranteeType,
        });
    }

    return updateNodeAttributes(poolPath, toModify).then(() => {
        return transferPoolQuota({poolPath, transferData, tree});
    });
}

interface TransferPoolQuotaParams {
    poolPath: string;
    transferData: Array<{diff: number; source: string; path: string}>;
    tree: string;
}

function transferPoolQuota({poolPath, transferData, tree}: TransferPoolQuotaParams) {
    if (isEmpty_(transferData)) {
        return Promise.resolve();
    }
    const tmp = poolPath.split('/');
    const dstPool = tmp[tmp.length - 1];

    const requests = map_(transferData, (v) => {
        const {diff, source, path} = v;
        const transferPath = path.startsWith(INTEGRAL_GUARANTEES_PREFIX)
            ? path.substr(INTEGRAL_GUARANTEES_PREFIX.length)
            : path;
        const dotPath = transferPath.replace(/\//g, '.');

        const delta = update_({}, dotPath, () => Math.abs(diff));

        return {
            command: 'transfer_pool_resources' as const,
            parameters: {
                source_pool: diff > 0 ? source : dstPool,
                destination_pool: diff > 0 ? dstPool : source,
                pool_tree: tree,
                resource_delta: delta,
            },
        };
    });

    return ytApiV4Id
        .executeBatch(YTApiId.schedulingTransferPoolQuota, {requests})
        .then((res: any) => {
            const err = getBatchError(res.results, 'Failed to transfer pool quota');
            if (err) {
                return Promise.reject(err);
            }
            return res;
        });
}

export function schedulingLoadFilterAttributes(
    tree: string,
    {checkFilters}: {checkFilters?: boolean} = {},
): SchedulingThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        if (checkFilters && !schedulingOverviewHasFilter(state)) {
            return undefined;
        }

        const {lastTime, lastTree} = getSchedulingAttributesToFilterParams(state);
        if (tree === lastTree && Date.now() - lastTime < 120000) {
            return undefined;
        }

        return wrapApiPromiseByToaster(
            ytApiV3Id.get(YTApiId.schedulingFilterAttributes, {
                path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools`,
                fields: ['parent', 'abc'],
                ...USE_CACHE,
            }),
            {
                skipSuccessToast: true,
                toasterName: 'schedulingLoadFilterAttributes',
                errorContent: 'Failed to load attributes required for filtering',
            },
        ).then((attributesToFilter) => {
            dispatch({
                type: SCHEDULING_DATA_PARTITION,
                data: {
                    attributesToFilter,
                    attributesToFilterParams: {lastTime: Date.now(), lastTree: tree},
                },
            });
        });
    };
}

export function schedulingSetAbcFilter(abcService?: {
    id?: number;
    slug?: string;
}): SchedulingThunkAction {
    return (dispatch, getState) => {
        const {id, slug} = abcService ?? {};
        dispatch(schedulingLoadFilterAttributes(getTree(getState())));
        dispatch({
            type: SCHEDULING_DATA_PARTITION,
            data: {abcServiceFilter: {id, slug}},
        });
    };
}
