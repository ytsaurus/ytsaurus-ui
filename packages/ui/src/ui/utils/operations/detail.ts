import moment from 'moment';

import {formatByParams} from '../../../shared/utils/format';
import ypath from '../../common/thor/ypath';
import {getMetrics} from '../../common/utils/metrics';
import {ytApiV3} from '../../rum/rum-wrap-api';
import {PLEASE_PROCEED_TEXT} from '../../utils/actions';
import {hasTaskHistograms} from './jobs';

import type {DetailedOperationSelector} from '../../pages/operations/selectors';
import type {IconName} from '../../components/Icon/Icon';

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

interface PerformActionOptions<T = unknown> {
    operation: DetailedOperationSelector;
    name: OperationActionName;
    options?: {value: T; data?: {parameters: Record<string, unknown>}}[];
    updateOperation?: (data: unknown) => void;
    currentOption: T;
}

export function performAction<T = unknown>({
    updateOperation,
    operation,
    currentOption,
    options = [],
    name,
}: PerformActionOptions<T>) {
    const option = options.find((o) => o?.value === currentOption);
    let parameters = {operation_id: operation.$value};
    if (option?.data?.parameters) {
        parameters = {...parameters, ...option.data.parameters};
    }

    getMetrics().countEvent('operation_detail_action', name);

    return ytApiV3[`${name}Operation`](parameters).then(updateOperation);
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
        job_sizes: {show: Boolean(showJobSizes)},
        partition_sizes: {show: Boolean(showPartitionSizes)},
    };
}

export interface OperationAction {
    modalKey: string;
    name: OperationActionName;
    successMessage: string;
    icon: IconName;
    message?: string;
    confirmationText?: string;
    details?: string;
    theme?: 'action';
    optionMessage?: string;
    optionValue?: string;
    optionType?: 'radio';
    options?: Array<{
        data?: any;
        text: string;
        value: string;
    }>;
}

export function prepareActions(operation: DetailedOperationSelector) {
    const actions: Array<OperationAction> = [];
    const suspended = ypath.getBoolean(operation, '/@suspended');
    const state = operation.state;

    if (state !== 'completed' && state !== 'failed' && state !== 'aborted') {
        actions.push({
            modalKey: 'abort',
            name: 'abort',
            successMessage: 'Operation was successfully aborted',
            icon: 'stop-circle',
            message:
                "Operation will be aborted with all running jobs, this will cause losing some jobs' data. Are you sure you want to proceed?",
            confirmationText: PLEASE_PROCEED_TEXT,
        });
    }

    if (state === 'running') {
        actions.push({
            modalKey: 'complete',
            name: 'complete',
            successMessage: 'Operation was successfully completed',
            icon: 'check-circle',
            message:
                "Operation will be immediately completed. Running jobs will be aborted, this will cause losing some jobs' data. Are you sure you want to proceed?",
            confirmationText: PLEASE_PROCEED_TEXT,
        });

        if (suspended) {
            actions.push({
                modalKey: 'resume',
                name: 'resume',
                details: 'Operation will be resumed.',
                successMessage: 'Operation was successfully resumed',
                icon: 'play-circle',
                theme: 'action',
            });
        } else {
            actions.push({
                modalKey: 'suspend',
                name: 'suspend',
                details: 'Operation will be suspended.',
                successMessage: 'Operation was successfully suspended',
                icon: 'pause-circle',
                optionMessage: 'Running jobs strategy',
                optionValue: 'abort',
                optionType: 'radio',
                options: [
                    {
                        data: {
                            parameters: {abort_running_jobs: true},
                        },
                        value: 'abort',
                        text: 'Abort running jobs',
                    },
                    {
                        data: {
                            parameters: {},
                        },
                        value: 'retain',
                        text: 'Retain running jobs',
                    },
                ],
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
