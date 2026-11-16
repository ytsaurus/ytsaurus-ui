import moment from 'moment';

import {formatByParams} from '../../../shared/utils/format';
import ypath from '../../common/thor/ypath';
import {getMetrics} from '../../common/utils/metrics';
import {ytApiV3} from '../../rum/rum-wrap-api';
import {hasTaskHistograms} from './jobs';
import {wrapApiPromiseByToaster} from '../utils';

import i18n from './i18n';

import {type DetailedOperationSelector} from '../../pages/operations/selectors';
import {type IconName} from '../../components/Icon/Icon';

export function isTransactionAlive(transactionId?: string): Promise<boolean> {
    if (!isValidTransactionId(transactionId)) {
        return Promise.resolve(false);
    }

    return ytApiV3.exists({path: '#' + transactionId}).then(
        (flag) => flag,
        () => false,
    );
}

export function isValidTransactionId(txId?: string) {
    return txId && txId !== '0-0-0-0';
}

export function checkUserTransaction(operationAttributes: {
    user_transaction_id?: {$value?: string};
}) {
    const transactionId = operationAttributes.user_transaction_id?.$value;
    return Promise.all([Promise.resolve(operationAttributes), isTransactionAlive(transactionId)]);
}

type OperationActionName = 'complete' | 'abort' | 'resume' | 'suspend';

export type RunningJobsStrategy = 'abort' | 'retain';

interface PerformActionOptions {
    operation: DetailedOperationSelector;
    name: OperationActionName;
    runningJobsStrategy?: RunningJobsStrategy;
    successMessage: string;
}

export function performAction({
    operation,
    name,
    runningJobsStrategy,
    successMessage,
}: PerformActionOptions) {
    const parameters = {
        operation_id: operation.$value,
        ...(name === 'suspend' && runningJobsStrategy === 'abort'
            ? {abort_running_jobs: true}
            : {}),
    };

    getMetrics().countEvent('operation_detail_action', name);

    return wrapApiPromiseByToaster(ytApiV3[`${name}Operation` as const](parameters), {
        toasterName: 'confirm action',
        successTitle: successMessage,
        skipErrorToast: true,
        timeout: 5000,
    });
}

export function getDetailsTabsShowSettings(operation: unknown) {
    const progress = ypath.getValue(operation, '/@progress');
    const showJobSizes =
        hasTaskHistograms(operation) ||
        (progress &&
            (ypath.getValue(progress, '/estimated_input_data_size_histogram') ||
                ypath.getValue(progress, '/input_data_size_histogram')));
    const showPartitionSizes = progress && ypath.getValue(progress, '/partition_size_histogram');

    return {
        job_sizes: {show: Boolean(showJobSizes), title: i18n('tab_job-sizes')},
        partition_sizes: {show: Boolean(showPartitionSizes), title: i18n('tab_partition-sizes')},
    };
}

export interface OperationAction {
    name: OperationActionName;
    successMessage: string;
    icon: IconName;
    message?: string;
    requireConfirmation?: boolean;
    details?: string;
    theme?: 'action';
}

export function prepareActions(operation: DetailedOperationSelector) {
    const actions: Array<OperationAction> = [];
    const suspended = ypath.getBoolean(operation, '/@suspended');
    const state = operation.state;

    if (state !== 'completed' && state !== 'failed' && state !== 'aborted') {
        actions.push({
            name: 'abort',
            successMessage: i18n('alert_operation-aborted'),
            icon: 'stop-circle',
            message: i18n('confirm_abort-operation'),
            requireConfirmation: true,
        });
    }

    if (state === 'running') {
        actions.push({
            name: 'complete',
            successMessage: i18n('alert_operation-completed'),
            icon: 'check-circle',
            message: i18n('confirm_complete-operation'),
            requireConfirmation: true,
        });

        if (suspended) {
            actions.push({
                name: 'resume',
                details: i18n('confirm_resume-operation'),
                successMessage: i18n('alert_operation-resumed'),
                icon: 'play-circle',
                theme: 'action',
            });
        } else {
            actions.push({
                name: 'suspend',
                details: i18n('confirm_suspend-operation'),
                successMessage: i18n('alert_operation-suspended'),
                icon: 'pause-circle',
            });
        }
    }

    return actions;
}

export function operationMonitoringUrl(params: {
    cluster: string;
    operation: {id: string; startTime?: string; finishTime?: string};
    pool: string;
    tree: string;
    slotIndex?: number;
    urlTemplate: string;
}) {
    const {cluster, operation, urlTemplate, pool, tree, slotIndex} = params;
    return formatByParams(urlTemplate, {
        ytCluster: cluster,
        ytOperationId: operation.id,
        ytPool: pool,
        ytPoolTree: tree,
        ytSlotIndex: slotIndex ?? '',
        fromTimeMs: operation.startTime ? moment(operation.startTime).valueOf() : '',
        toTimeMs: operation.finishTime ? moment(operation.finishTime).valueOf() : '',
    });
}
