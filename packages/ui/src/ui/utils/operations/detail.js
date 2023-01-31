import ypath from '../../common/thor/ypath';
import metrics from '../../common/utils/metrics';
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import _ from 'lodash';
import {PLEASE_PROCEED_TEXT} from '../../utils/actions';
import {hasTaskHistograms} from './jobs';

function isTransactionAlive(transactionId) {
    return yt.v3.exists({path: '#' + transactionId}).then(
        (flag) => flag,
        () => false,
    );
}

export function checkUserTransaction(operationAttributes) {
    const transactionId = operationAttributes.user_transaction_id?.$value;
    return Promise.all(
        transactionId && transactionId !== '0-0-0-0'
            ? [Promise.resolve(operationAttributes), isTransactionAlive(transactionId)]
            : [Promise.resolve(operationAttributes), Promise.resolve(false)],
    );
}

export function performAction({updateOperation, operation, currentOption, options, name}) {
    const option = _.find(options, (option) => option.value === currentOption);
    let parameters = {operation_id: operation.$value};
    if (option?.data?.parameters) {
        parameters = {...parameters, ...option.data.parameters};
    }

    metrics.countEvent({
        operation_detail_action: name,
    });

    return yt.v3[name + 'Operation'](parameters).then(updateOperation);
}

export function getDetailsTabsShowSettings(operation, statisticsItems) {
    const progress = ypath.getValue(operation, '/@progress');
    const showJobSizes =
        hasTaskHistograms(operation) ||
        (progress &&
            (ypath.getValue(progress, '/estimated_input_data_size_histogram') ||
                ypath.getValue(progress, '/input_data_size_histogram')));
    const showPartitionSizes = progress && ypath.getValue(progress, '/partition_size_histogram');

    return {
        statistics: {
            show: statisticsItems?.length > 0,
        },
        job_sizes: {
            show: Boolean(showJobSizes),
        },
        partition_sizes: {
            show: Boolean(showPartitionSizes),
        },
    };
}

export function prepareActions(operation) {
    const actions = [];
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
