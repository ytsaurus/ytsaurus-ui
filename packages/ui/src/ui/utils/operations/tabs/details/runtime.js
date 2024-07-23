import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';
import hammer from '../../../../common/hammer';

export function formatShare(value) {
    return hammer.format['SmallNumber'](value, {significantDigits: 4});
}

export function prepareRuntime(operation) {
    const progress = ypath.getValue(operation, '/@progress');

    if (progress && operation.isRunning()) {
        let trees = ypath.getValue(progress, '/scheduling_info_per_pool_tree');

        trees =
            trees &&
            map_(trees, (treeFairShareInfo, treeName) => ({
                progress: treeFairShareInfo,
                name: treeName,
            }));

        return trees;
    }
}
