import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import _ from 'lodash';

import {getOperation} from '../../../store/actions/operations/detail';
import {updateOperations} from '../../../store/actions/operations/list';
import {
    SHOW_EDIT_WEIGHT_POOL_MODAL,
    HIDE_EDIT_WEIGHT_POOL_MODAL,
    SET_PULLS_AND_WEIGHTS,
} from '../../../constants/operations';
import {Page} from '../../../constants';

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

export function setPoolsAndWeights(operation, pools, weights) {
    const pathItems = window.location.pathname.split('/');
    const inOperationsList = pathItems.length === 3 && pathItems[2] === Page.OPERATIONS;
    const operationId = operation.$value;

    const poolTrees = _.reduce(
        operation.pools,
        (acc, item) => {
            const {tree} = item;
            acc[tree] = item;
            return acc;
        },
        {},
    );

    return (dispatch) => {
        dispatch({
            type: SET_PULLS_AND_WEIGHTS.REQUEST,
        });

        const params = _.reduce(
            pools,
            (res, pool, tree) => {
                const old = poolTrees[tree];
                if (weights[tree] && old.weight !== Number(weights[tree])) {
                    res[tree] = Object.assign({}, {weight: Number(weights[tree])});
                }
                if (old.pool !== pools[tree]) {
                    res[tree] = Object.assign(res[tree] || {}, {
                        pool: pools[tree],
                    });
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
                    dispatch(updateOperations());
                } else {
                    dispatch(getOperation(operationId));
                }

                dispatch({
                    type: SET_PULLS_AND_WEIGHTS.SUCCESS,
                });
                dispatch({
                    type: HIDE_EDIT_WEIGHT_POOL_MODAL,
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({
                        type: SET_PULLS_AND_WEIGHTS.CANCELLED,
                    });
                } else {
                    dispatch({
                        type: SET_PULLS_AND_WEIGHTS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}
