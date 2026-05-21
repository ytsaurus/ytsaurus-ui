import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import reduce_ from 'lodash/reduce';

import {getOperation} from '../../../store/actions/operations/detail';
import {updateOperationsList} from '../../../store/actions/operations/list';
import {
    CHECK_OPERATION_PERMISSIONS,
    HIDE_EDIT_WEIGHT_POOL_MODAL,
    SET_POOLS_AND_WEIGHTS,
    SHOW_EDIT_WEIGHT_POOL_MODAL,
} from '../../../constants/operations';
import {Page} from '../../../constants';
import hammer from '../../../common/hammer';
import {checkUserPermissionsUI} from '../../../utils/acl/acl-api';
import {OPERATION_POOL_RESOURCE_LIMIT_KEYS} from '../../../pages/operations/selectors';

export * from '../../../store/actions/operations/list';

export function showEditPoolsWeightsModal(operation, editable = true) {
    return {
        type: SHOW_EDIT_WEIGHT_POOL_MODAL,
        data: {operation, editable},
    };
}

export function hideEditPoolsWeightsModal() {
    return {
        type: HIDE_EDIT_WEIGHT_POOL_MODAL,
    };
}

export function checkOperationPermissions(operation, user) {
    return (dispatch) => {
        const operationValue = operation?.$value;
        if (!operationValue || !user) {
            return;
        }

        dispatch({type: CHECK_OPERATION_PERMISSIONS.REQUEST});

        const hashPrefix = hammer.utils.extractFirstByte(operationValue);
        const operationPath = `//sys/operations/${hashPrefix}/${operationValue}`;

        checkUserPermissionsUI(operationPath, user, ['manage'])
            .then((results) => {
                const hasWritePermission = results.every(({action}) => action === 'allow');
                dispatch({
                    type: CHECK_OPERATION_PERMISSIONS.SUCCESS,
                    data: {hasWritePermission},
                });
            })
            .catch((error) => {
                dispatch({
                    type: CHECK_OPERATION_PERMISSIONS.FAILURE,
                    data: {error},
                });
            });
    };
}

function diffResourceLimits(oldLimits = {}, newLimits = {}) {
    return reduce_(
        OPERATION_POOL_RESOURCE_LIMIT_KEYS,
        (acc, key) => {
            const newVal = newLimits[key];
            const oldVal = oldLimits[key];

            if (newVal) {
                acc.merged[key] = newVal;
                if (newVal !== oldVal) {
                    acc.changed = true;
                }
            } else if (oldVal !== null) {
                acc.merged[key] = null;
                acc.changed = true;
            }
            return acc;
        },
        {changed: false, merged: {}},
    );
}

export function setPoolsAndWeights(
    operation,
    pools,
    weights,
    resourceLimits,
    {closeOnSuccess = true} = {},
) {
    const pathItems = window.location.pathname.split('/');
    const inOperationsList = pathItems.length === 3 && pathItems[2] === Page.OPERATIONS;
    const operationId = operation.$value;

    const poolTrees = reduce_(
        operation.pools,
        (acc, item) => {
            acc[item.tree] = item;
            return acc;
        },
        {},
    );

    return (dispatch) => {
        dispatch({type: SET_POOLS_AND_WEIGHTS.REQUEST});

        const params = reduce_(
            pools,
            (res, pool, tree) => {
                const old = poolTrees[tree] || {};
                const treeParams = {};

                const newWeight = weights[tree];
                if (newWeight && old.weight !== Number(newWeight)) {
                    treeParams.weight = Number(newWeight);
                }
                if (old.pool !== pool) {
                    treeParams.pool = pool;
                }
                if (resourceLimits?.[tree]) {
                    const {changed, merged} = diffResourceLimits(
                        old.resourceLimits,
                        resourceLimits[tree],
                    );
                    if (changed) {
                        treeParams.resource_limits = merged;
                    }
                }

                if (Object.keys(treeParams).length > 0) {
                    res[tree] = treeParams;
                }
                return res;
            },
            {},
        );

        return yt.v3
            .updateOperationParameters({
                operation_id: operationId,
                _parameters: {
                    scheduling_options_per_pool_tree: params,
                },
            })
            .then(() => {
                if (inOperationsList) {
                    dispatch(updateOperationsList());
                } else {
                    dispatch(getOperation(operationId));
                }

                dispatch({type: SET_POOLS_AND_WEIGHTS.SUCCESS});
                if (closeOnSuccess) {
                    dispatch({type: HIDE_EDIT_WEIGHT_POOL_MODAL});
                }
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: SET_POOLS_AND_WEIGHTS.CANCELLED});
                    return undefined;
                }
                dispatch({
                    type: SET_POOLS_AND_WEIGHTS.FAILURE,
                    data: {error},
                });
                return Promise.reject(error);
            });
    };
}
