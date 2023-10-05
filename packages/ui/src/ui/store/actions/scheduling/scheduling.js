import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import _ from 'lodash';

import CancelHelper from '../../../utils/cancel-helper';
import {Toaster} from '@gravity-ui/uikit';

import {getSchedulingNS} from '../../../store/selectors/settings';
import {toggleFavourite} from '../../../store/actions/favourites';
import {getPool, getPools, getTree} from '../../../store/selectors/scheduling/scheduling';
import {
    POOL_GENERAL_TYPE_TO_ATTRIBUTE,
    computePoolPath,
    prepareCurrentTree,
    prepareTrees,
} from '../../../utils/scheduling/scheduling';

import {
    CHANGE_CONTENT_MODE,
    CHANGE_FILTER,
    CHANGE_POOL,
    CHANGE_POOL_CHILDREN_FILTER,
    CHANGE_TABLE_TREE_STATE,
    CHANGE_TREE,
    ROOT_POOL_NAME,
    SCHEDULING_DATA_CANCELLED,
    SCHEDULING_DATA_FAILURE,
    SCHEDULING_DATA_PARTITION,
    SCHEDULING_DATA_REQUEST,
    SCHEDULING_DATA_SUCCESS,
    SCHEDULING_DELETE_POOL_FAILURE,
    SCHEDULING_DELETE_POOL_REQUEST,
    SCHEDULING_DELETE_POOL_SUCCESS,
    SCHEDULING_EDIT_POOL_CANCELLED,
    SCHEDULING_EDIT_POOL_FAILURE,
    SCHEDULING_EDIT_POOL_REQUEST,
    SCHEDULING_EDIT_POOL_SUCCESS,
    TOGGLE_DELETE_VISIBILITY,
    TOGGLE_EDIT_VISIBILITY,
} from '../../../constants/scheduling';
import {setPoolAttributes} from './scheduling-ts';
import {loadSchedulingOperations} from './scheduling-operations';
import {
    isSupportedFieldsFilter,
    isSupportedSchedulingOperationsPerPool,
} from '../../selectors/thor/support';
import {extractBatchV4Values, splitBatchResults} from '../../../utils/utils';
import {RumWrapper, YTApiId, ytApiV3Id, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {getCluster} from '../../../store/selectors/global';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';

const toaster = new Toaster();
const requests = new CancelHelper();

const commands = [
    {
        command: 'get',
        parameters: {
            path: '//sys/scheduler/@alerts',
        },
    },
    {
        command: 'list',
        parameters: {
            path: '//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree',
        },
    },
    {
        command: 'get',
        parameters: {
            path: '//sys/scheduler/orchid/scheduler/default_fair_share_tree',
        },
    },
];

function loadTreeRequests(tree, {useOperationsPerPool, allowFieldsFilter}) {
    const requests = [
        {
            command: 'get',
            parameters: {
                path: `//sys/pool_trees/${tree}`,
                attributes: [
                    'acl',
                    'abc',
                    'integral_guarantees',
                    'weight',
                    'max_operation_count',
                    'max_running_operation_count',
                    'strong_guarantee_resources',
                    'resource_limits',
                    'forbid_immediate_operations',
                    'create_ephemeral_subpools',
                    'fifo_sort_parameters',
                    'config',
                    'folder_id',
                ],
            },
        },
        {
            command: 'get',
            parameters: {
                path: useOperationsPerPool
                    ? `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/resource_usage`
                    : `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/resource_usage`,
            },
        },
        {
            command: 'get',
            parameters: {
                path: useOperationsPerPool
                    ? `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/resource_limits`
                    : `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/resource_limits`,
            },
        },
        {
            command: 'get',
            parameters: {
                path: useOperationsPerPool
                    ? `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/config`
                    : `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/config`,
            },
        },
        {
            command: 'get',
            parameters: {
                path: useOperationsPerPool
                    ? `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/resource_distribution_info`
                    : `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/fair_share_info/resource_distribution_info`,
            },
        },
        {
            command: 'get',
            parameters: {
                path: useOperationsPerPool
                    ? `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools`
                    : `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/fair_share_info/pools`,
                ...(allowFieldsFilter
                    ? {
                          fields: [
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
                          ],
                      }
                    : {}),
            },
        },
    ];

    return requests;
}

export function loadSchedulingData() {
    return (dispatch, getState) => {
        dispatch({type: SCHEDULING_DATA_REQUEST});

        const cluster = getCluster(getState());
        const rumId = new RumWrapper(cluster, RumMeasureTypes.SCHEDULING);
        return rumId
            .fetch(
                YTApiId.schedulingData,
                ytApiV3Id.executeBatch(YTApiId.schedulingData, {requests: commands}),
            )
            .then((data) => {
                const {
                    error,
                    results: [schedulerAlerts, rawTrees, defaultTree],
                } = splitBatchResults(data);

                if (error) {
                    return Promise.reject(error);
                }

                const state = getState();

                const trees = prepareTrees(rawTrees);
                const tree = prepareCurrentTree(defaultTree, trees, state.scheduling.tree);

                dispatch({
                    type: SCHEDULING_DATA_PARTITION,
                    data: {schedulerAlerts, trees, tree},
                });

                dispatch(loadSchedulingOperations(tree));

                const useOperationsPerPool = isSupportedSchedulingOperationsPerPool(state);
                const allowFieldsFilter = isSupportedFieldsFilter(state);

                const treeRequests = loadTreeRequests(tree, {
                    useOperationsPerPool,
                    allowFieldsFilter,
                });

                return rumId
                    .fetch(
                        YTApiId.schedulingLoadTree,
                        ytApiV4Id.executeBatch(YTApiId.schedulingLoadTree, {
                            requests: treeRequests,
                        }),
                    )
                    .then((data) => {
                        const extracted = extractBatchV4Values(data, treeRequests);
                        const {error, results} = splitBatchResults(extracted.results);
                        if (error) {
                            throw error;
                        }
                        return results;
                    });
            })
            .then(
                ([
                    treeAttributes,
                    resource_usage,
                    resource_limits,
                    config,
                    resource_distribution_info,
                    pools,
                ]) => {
                    const treeResources = {
                        resource_usage,
                        resource_limits,
                        config,
                        resource_distribution_info,
                    };

                    let pool = getPool(getState());
                    if (!pools[pool]) {
                        pool = ROOT_POOL_NAME;
                    }

                    dispatch({
                        type: SCHEDULING_DATA_SUCCESS,
                        data: {
                            treeResources,
                            pool,
                            rawPools: pools,
                            rawTreeAttributes: treeAttributes,
                        },
                    });
                },
            )
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

export function deletePool(item) {
    return (dispatch, getState) => {
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
                    timeout: 10000,
                    type: 'success',
                    title: `Successfully deleted ${item.name}. Please wait.`,
                });

                dispatch({type: SCHEDULING_DELETE_POOL_SUCCESS});
                dispatch(closeDeleteModal());
                setTimeout(() => dispatch(loadSchedulingData()), 3000);
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: SCHEDULING_DELETE_POOL_FAILURE,
                        data: {error},
                    });

                    return Promise.reject();
                }
            });
    };
}

const setName = (path, newName, prevName) => {
    if (prevName === newName) {
        return Promise.resolve();
    }

    return yt.v3.set({path: `${path}/@name`}, newName);
};

const makeOtherAttributesCommands = (path, values, initialValues) => {
    const initialSortParamsString = initialValues.fifoSortParams.join('|');
    const newSortParamsString = values.fifoSortParams.join('|');

    const commands = [];

    if (initialValues.forbidImmediateOperations !== values.forbidImmediateOperations) {
        commands.push({
            command: 'set',
            parameters: {
                path: `${path}/@forbid_immediate_operations`,
            },
            input: values.forbidImmediateOperations,
        });
    }

    if (initialValues.createEphemeralSubpools !== values.createEphemeralSubpools) {
        commands.push({
            command: 'set',
            parameters: {
                path: `${path}/@create_ephemeral_subpools`,
            },
            input: values.createEphemeralSubpools,
        });
    }

    if (initialSortParamsString !== newSortParamsString) {
        commands.push({
            command: 'set',
            parameters: {
                path: `${path}/@fifo_sort_parameters`,
            },
            input: values.fifoSortParams,
        });
    }

    return commands;
};

const setResourceAttributes = (path, values, omittedValues, attribute) => {
    if (_.isEmpty(values) && _.isEmpty(omittedValues)) {
        return Promise.resolve();
    }

    const keyMapper = {userSlots: 'user_slots'};
    const omittedValuesList = _.map(omittedValues, (value, key) => keyMapper[key] || key);
    const preparedValues = _.mapKeys(values, (value, key) => keyMapper[key] || key);

    return ytApiV3Id
        .get(YTApiId.schedulingGetAttrsBeforeEdit, {path: `${path}/@${attribute}`})
        .then((resources) => {
            const result = {...resources, ...preparedValues};
            const input = _.omit(result, omittedValuesList);

            return yt.v3.set({path: `${path}/@${attribute}`}, input);
        })
        .catch((error) => {
            if (error.code === 500) {
                // attribute not found
                return yt.v3.set({path: `${path}/@${attribute}`}, preparedValues);
            }

            return Promise.reject(error);
        });
};

const makeGeneralCommands = (path, values, initialValues) => {
    const isInitial = (value, initialValue) => value === initialValue;
    const isOmitted = (value, omittedValues) =>
        Object.prototype.hasOwnProperty.call(omittedValues, value);

    //const {name: abcServiceName, slug: abcServiceSlug, id} = prepareAbcService(values.abcService);
    const omittedValues = _.pickBy(
        values,
        (value) => value === '' || value === undefined || value === null,
    );

    const commands = [];

    // if (!isInitial(abcServiceSlug, initialValues.abcService?.value)) {
    //     commands.push({
    //         command: abcServiceSlug ? 'set' : 'remove',
    //         parameters: {
    //             path: `${path}/@abc`,
    //         },
    //         input: !abcServiceSlug ? undefined : {
    //             slug: abcServiceSlug,
    //             name: abcServiceName,
    //             id,
    //         },
    //     });
    // }

    if (!isInitial(values.mode, initialValues.mode)) {
        commands.push({
            command: 'set',
            parameters: {
                path: `${path}/@mode`,
            },
            input: values.mode,
        });
    }

    if (!isInitial(values.weight, initialValues.weight)) {
        if (isOmitted('weight', omittedValues)) {
            commands.push({
                command: 'remove',
                parameters: {
                    path: `${path}/@weight`,
                },
            });
        } else if (!isInitial(values.weight, initialValues.weight)) {
            commands.push({
                command: 'set',
                parameters: {
                    path: `${path}/@weight`,
                },
                input: Number(values.weight),
            });
        }
    }

    return commands;
};

function isInvalidNumber(value) {
    return value === '' || isNaN(Number(value));
}

function isValidNumber(value) {
    return !isInvalidNumber(value);
}

export function editPool(pool, values, initialValues) {
    return (dispatch, getState) => {
        const state = getState();

        const tree = getTree(state);
        const pools = getPools(state);
        const poolPath = computePoolPath(pool, pools);
        const path = `//sys/pool_trees/${tree}/${poolPath}`;

        const filteredResourceLimitsValues = _.pickBy(values.resourceLimits, isValidNumber);
        const omittedResourceLimitsValues = _.pickBy(values.resourceLimits, isInvalidNumber);
        const resourceLimitsValues = _.mapValues(filteredResourceLimitsValues, (value) =>
            Number(value),
        );
        delete resourceLimitsValues['error-block'];
        delete omittedResourceLimitsValues['error-block'];

        dispatch({type: SCHEDULING_EDIT_POOL_REQUEST});

        const requests = [
            ...makeGeneralCommands(path, values.general, initialValues.general),
            ...makeOtherAttributesCommands(path, values.otherSettings, initialValues.otherSettings),
        ];

        return Promise.all([
            ytApiV3Id.executeBatch(YTApiId.schedulingEditPool, {requests}).then((data) => {
                const {error} = splitBatchResults(data);
                if (error) {
                    return Promise.reject(error);
                }
            }),
            setPoolAttributes({
                poolPath: path,
                values: {
                    ...values.resourceGuarantee,
                    ...values.integralGuarantee,
                    ..._.pick(values.general, Object.keys(POOL_GENERAL_TYPE_TO_ATTRIBUTE)),
                },
                initials: {
                    ...initialValues.resourceGuarantee,
                    ...initialValues.integralGuarantee,
                    ..._.pick(initialValues.general, Object.keys(POOL_GENERAL_TYPE_TO_ATTRIBUTE)),
                },
                tree,
            }),
            setResourceAttributes(
                path,
                resourceLimitsValues,
                omittedResourceLimitsValues,
                'resource_limits',
            ),
        ])
            .then(setName(path, values.general.name, initialValues.general.name))
            .then(() => {
                toaster.add({
                    name: 'edit pool',
                    timeout: 10000,
                    type: 'success',
                    title: `Successfully edited ${pool.name}. Please wait.`,
                });

                dispatch({type: SCHEDULING_EDIT_POOL_SUCCESS});
                dispatch(closeEditModal());
                setTimeout(() => dispatch(loadSchedulingData()), 3000);
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: SCHEDULING_EDIT_POOL_FAILURE,
                        data: {error},
                    });

                    return Promise.reject();
                }
            });
    };
}

export function openDeleteModal(item) {
    return {
        type: TOGGLE_DELETE_VISIBILITY,
        data: {
            visibility: true,
            item,
        },
    };
}

export function closeDeleteModal() {
    return {
        type: TOGGLE_DELETE_VISIBILITY,
        data: {
            visibility: false,
            item: undefined,
        },
    };
}

export function openEditModal(item) {
    return {
        type: TOGGLE_EDIT_VISIBILITY,
        data: {
            visibility: true,
            item,
        },
    };
}

export function closeEditModal({cancelled} = {}) {
    return (dispatch) => {
        dispatch({
            type: TOGGLE_EDIT_VISIBILITY,
            data: {
                visibility: false,
                item: undefined,
            },
        });

        if (cancelled) {
            dispatch({type: SCHEDULING_EDIT_POOL_CANCELLED});
        }
    };
}

export function changeTree(tree) {
    return (dispatch) => {
        dispatch({
            type: CHANGE_TREE,
            data: {tree},
        });

        dispatch(loadSchedulingData());
    };
}

export function changeTableTreeState(treeState) {
    return {
        type: CHANGE_TABLE_TREE_STATE,
        data: {treeState},
    };
}

export function changePool(pool) {
    return {
        type: CHANGE_POOL,
        data: {pool},
    };
}

export function changeFilter(filter) {
    return {
        type: CHANGE_FILTER,
        data: {filter},
    };
}

export function changeAbcServiceFilter(slug) {
    return {
        type: SCHEDULING_DATA_PARTITION,
        data: {abcServiceFilter: {slug}},
    };
}

export function changeContentMode(evt) {
    return {
        type: CHANGE_CONTENT_MODE,
        data: {
            contentMode: evt.target.value,
        },
    };
}

export function changePoolChildrenFilter(poolChildrenFilter) {
    return {
        type: CHANGE_POOL_CHILDREN_FILTER,
        data: {poolChildrenFilter},
    };
}

export function togglePoolFavourites(pool, tree) {
    return (dispatch, getState) => {
        const value = `${pool}[${tree}]`;
        const parentNS = getSchedulingNS(getState());
        return dispatch(toggleFavourite(value, parentNS));
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: SCHEDULING_DATA_CANCELLED});
    };
}
