import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import _ from 'lodash';
import ypath from '../../../common/thor/ypath';

import {GET_OPERATION, LOAD_RESOURCE_USAGE} from '../../../constants/operations/detail';
import {DetailedOperationSelector} from '../../../pages/operations/selectors';
import {checkUserTransaction} from '../../../utils/operations/detail';
import {prepareAttributes} from '../../../utils';
import {showErrorPopup} from '../../../utils/utils';
import {isOperationId} from '../../../utils/operations/list';
import {TYPED_OUTPUT_FORMAT} from '../../../constants/index';
import {Toaster} from '@gravity-ui/uikit';
import Updater from '../../../utils/hammer/updater';
import CancelHelper from '../../../utils/cancel-helper';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getJobsMonitoringDescriptors} from '../../../store/actions/operations/jobs-monitor';

const updater = new Updater();
const toaster = new Toaster();
const operationDetailsRequests = new CancelHelper();

function getIsEphemeral([operationAttributes, userTransactionAlive]) {
    const treesInfo = ypath.get(
        operationAttributes,
        '/runtime_parameters/scheduling_options_per_pool_tree',
    );
    const trees = _.keys(treesInfo);
    const poolPaths = _.values(
        _.mapValues(
            treesInfo,
            (infoPerTree, tree) =>
                `${tree}/fair_share_info/pools/${ypath.getValue(
                    infoPerTree,
                    '/pool',
                )}/is_ephemeral`,
        ),
    );
    const requests = _.map(poolPaths, (path) => {
        return {
            command: 'get',
            parameters: {
                path: '//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/' + path,
            },
        };
    });
    const orchidAttributes = ytApiV3Id
        .executeBatch(YTApiId.operationIsEphemeral, {requests})
        .then((data) => {
            return _.map(data, ({error, output}) => {
                if (error) {
                    if (ypath.getNumber(error.code) === yt.codes.NODE_DOES_NOT_EXIST) {
                        return true;
                    }
                    return false;
                }
                return output;
            });
        })
        .then((res) => {
            return _.reduce(
                res,
                (res, poolInfo, index) => {
                    const tree = trees[index];
                    const pool = ypath.getValue(treesInfo[tree], '/pool');
                    const isEphemeral = ypath.getBoolean(poolInfo);

                    res[tree] = {
                        [pool]: {isEphemeral},
                    };

                    return res;
                },
                {},
            );
        });

    return Promise.all([operationAttributes, userTransactionAlive, orchidAttributes]);
}

function loadIntermediateResourceUsage(operation, callback) {
    return (dispatch) => {
        const outputTransaction = ypath.get(operation, '/@output_transaction_id');

        if (outputTransaction && outputTransaction !== '0-0-0-0') {
            dispatch({type: LOAD_RESOURCE_USAGE.REQUEST});

            return ytApiV3Id
                .get(YTApiId.operationIntermediateResourceUsage, {
                    path: '#' + outputTransaction + '/@resource_usage',
                })
                .then((resources) => {
                    callback();
                    dispatch({
                        type: LOAD_RESOURCE_USAGE.SUCCESS,
                        data: {resources},
                    });
                })
                .catch(() => {
                    callback();
                    dispatch({type: LOAD_RESOURCE_USAGE.FAILURE});
                });
        } else {
            callback();
            dispatch({type: LOAD_RESOURCE_USAGE.CANCELLED});
        }
    };
}

export function getOperation(id) {
    return (dispatch, getState) => {
        const isAlias = !isOperationId(id);

        const params = Object.assign(
            {
                include_scheduler: true,
                output_format: TYPED_OUTPUT_FORMAT,
            },
            isAlias ? {operation_alias: id} : {operation_id: id},
        );

        dispatch({type: GET_OPERATION.REQUEST, data: {isAlias, id}});

        return ytApiV3
            .getOperation(params, operationDetailsRequests)
            .then(checkUserTransaction)
            .then(getIsEphemeral)
            .then(([operationAttributes, userTransactionAlive, orchidAttributes]) => {
                const preparedAttributes = prepareAttributes(operationAttributes);
                const operation = new DetailedOperationSelector(
                    preparedAttributes,
                    operationAttributes,
                    orchidAttributes,
                );

                const dispatchOperationSuccess = () => {
                    dispatch({
                        type: GET_OPERATION.SUCCESS,
                        data: {operation, userTransactionAlive},
                    });
                };

                if (operation.inIntermediateState()) {
                    dispatch(loadIntermediateResourceUsage(operation, dispatchOperationSuccess));
                } else {
                    updater.remove('operation.detail');
                    dispatchOperationSuccess();
                }

                dispatch(getJobsMonitoringDescriptors(id));
            })
            .catch((error) => {
                const {operations} = getState();
                const isFirstLoading = !operations.detail.loaded;

                if (error.code !== yt.codes.CANCELLED) {
                    if (!isFirstLoading) {
                        toaster.createToast({
                            name: 'get operation',
                            allowAutoHiding: false,
                            type: 'error',
                            title: 'Failed to load operation',
                            content: error.message,
                            actions: [
                                {
                                    label: ' view',
                                    onClick: () => showErrorPopup(error),
                                },
                            ],
                        });
                    }

                    dispatch({
                        type: GET_OPERATION.FAILURE,
                        data: {
                            message: `Error occured when loading operation "${id}"`,
                            details: error,
                        },
                    });

                    updater.remove('operation.detail');
                }
            });
    };
}
