import mapValues_ from 'lodash/mapValues';
import ypath from '../../../common/thor/ypath';

import {
    prepareCompletedUsage,
    prepareIntermediateUsage,
} from '../../../utils/operations/tabs/details/data-flow';
import {prepareSpecification} from '../../../utils/operations/tabs/details/specification/specification';
import {prepareOperationEvents} from '../../../utils/operations/tabs/details/events/events';
import {prepareRuntime} from '../../../utils/operations/tabs/details/runtime';
import {prepareAlerts} from '../../../utils/operations/tabs/details/alerts';
import {prepareError} from '../../../utils/operations/tabs/details/error';

import {GET_OPERATION, LOAD_RESOURCE_USAGE} from '../../../constants/operations/detail';
import {DetailedOperationSelector} from '../../../pages/operations/selectors';
import {checkUserTransaction, prepareActions} from '../../../utils/operations/detail';
import {prepareAttributes} from '../../../utils';
import {showErrorPopup} from '../../../utils/utils';
import {isOperationId} from '../../../utils/operations/list';
import {TYPED_OUTPUT_FORMAT} from '../../../constants/index';
import {Toaster} from '@gravity-ui/uikit';
import CancelHelper from '../../../utils/cancel-helper';
import {YTErrors} from '../../../rum/constants';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getJobsMonitoringDescriptors} from '../../../store/actions/operations/jobs-monitor';

import type {RootState} from './../../../store/reducers';
import type {ThunkAction} from 'redux-thunk';
import type {OperationDetailActionType} from '../../reducers/operations/detail';

const toaster = new Toaster();
const operationDetailsRequests = new CancelHelper();

function getIsEphemeral([operationAttributes, userTransactionAlive]: Awaited<
    ReturnType<typeof checkUserTransaction>
>) {
    const treesInfo = ypath.get(
        operationAttributes,
        '/runtime_parameters/scheduling_options_per_pool_tree',
    );
    const trees = Object.keys(treesInfo);
    const poolPaths = Object.values(
        mapValues_(
            treesInfo,
            (infoPerTree, tree) =>
                `${tree}/pools/${ypath.getValue(infoPerTree, '/pool')}/is_ephemeral`,
        ),
    );
    const requests = poolPaths.map((path) => {
        return {
            command: 'get' as const,
            parameters: {
                path: '//sys/scheduler/orchid/scheduler/pool_trees/' + path,
            },
        };
    });
    const orchidAttributes = ytApiV3Id
        .executeBatch(YTApiId.operationIsEphemeral, {requests})
        .then((data) =>
            data.map(({error, output}) =>
                error
                    ? ypath.getNumberDeprecated(error.code) === YTErrors.NODE_DOES_NOT_EXIST
                    : output,
            ),
        )
        .then((res) =>
            res.reduce(
                (acc, poolInfo, index) => {
                    const tree = trees[index];
                    const pool = ypath.getValue(treesInfo[tree], '/pool');
                    const isEphemeral = ypath.getBoolean(poolInfo);

                    acc[tree] = {
                        [pool]: {isEphemeral},
                    };

                    return acc;
                },
                {} as Record<string, {isEphemeral: boolean}>,
            ),
        );

    return Promise.all([operationAttributes, userTransactionAlive, orchidAttributes]);
}

function loadIntermediateResourceUsage(
    operation: unknown,
    callback: () => void,
): ThunkAction<Promise<void>, RootState, unknown, OperationDetailActionType> {
    return async (dispatch) => {
        const outputTransaction = ypath.get(operation, '/@output_transaction_id');

        if (outputTransaction && outputTransaction !== '0-0-0-0') {
            dispatch({type: LOAD_RESOURCE_USAGE.REQUEST});

            return ytApiV3Id
                .get(YTApiId.operationIntermediateResourceUsage, {
                    path: '#' + outputTransaction + '/@resource_usage',
                })
                .then((resources) => {
                    callback();

                    const intermediateResources = prepareIntermediateUsage(operation, resources);

                    dispatch({
                        type: LOAD_RESOURCE_USAGE.SUCCESS,
                        data: {resources, intermediateResources},
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

export function getOperation(
    id: string,
): ThunkAction<Promise<void>, RootState, unknown, OperationDetailActionType> {
    return (dispatch, getState) => {
        const isAlias = !isOperationId(id);

        const params = Object.assign(
            {include_scheduler: true, output_format: TYPED_OUTPUT_FORMAT},
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
                    const actions = prepareActions(operation);

                    const specification = prepareSpecification(operation, userTransactionAlive);
                    const alerts = prepareAlerts(ypath.getValue(operation, '/@alerts'));
                    const alert_events = ypath.getValue(operation, '/@alert_events');
                    const error = prepareError(operation);
                    const runtime = prepareRuntime(operation);
                    const events = prepareOperationEvents(operation);
                    const resources = prepareCompletedUsage(operation);

                    const details = {
                        specification,
                        alerts,
                        alert_events,
                        error,
                        runtime,
                        events,
                        resources,
                    };

                    dispatch({
                        type: GET_OPERATION.SUCCESS,
                        data: {operation, actions, details},
                    });

                    dispatch(getJobsMonitoringDescriptors(id));
                };

                if (operation.inIntermediateState()) {
                    dispatch(loadIntermediateResourceUsage(operation, dispatchOperationSuccess));
                } else {
                    dispatchOperationSuccess();
                }
            })
            .catch((error) => {
                const {operations} = getState();
                const isFirstLoading = !operations.detail.loaded;

                if (error.code !== YTErrors.CANCELLED) {
                    if (!isFirstLoading) {
                        toaster.add({
                            name: 'get operation',
                            autoHiding: false,
                            theme: 'danger',
                            title: 'Failed to load operation',
                            content: error.message,
                            actions: [{label: ' view', onClick: () => showErrorPopup(error)}],
                        });
                    }

                    dispatch({
                        type: GET_OPERATION.FAILURE,
                        data: {
                            message: `Error occured when loading operation "${id}"`,
                            details: error,
                        },
                    });
                }
            });
    };
}
