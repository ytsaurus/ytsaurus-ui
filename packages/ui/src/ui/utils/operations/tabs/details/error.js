import ypath from '../../../../common/thor/ypath';

export function prepareError(operation) {
    if (operation.state === 'aborted' || operation.state === 'failed') {
        return ypath.getValue(operation, '/@result');
    }
}
