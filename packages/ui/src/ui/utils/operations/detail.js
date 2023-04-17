import ypath from '../../common/thor/ypath';
import metrics from '../../common/utils/metrics';
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import _ from 'lodash';
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

export function performAction({updateOperation, operation, currentOption, options = [], name}) {
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

export function getDetailsTabsShowSettings(operation) {
    const progress = ypath.getValue(operation, '/@progress');
    const showJobSizes =
        hasTaskHistograms(operation) ||
        (progress &&
            (ypath.getValue(progress, '/estimated_input_data_size_histogram') ||
                ypath.getValue(progress, '/input_data_size_histogram')));
    const showPartitionSizes = progress && ypath.getValue(progress, '/partition_size_histogram');

    return {
        job_sizes: {
            show: Boolean(showJobSizes),
        },
        partition_sizes: {
            show: Boolean(showPartitionSizes),
        },
    };
}
