import isEmpty_ from 'lodash/isEmpty';
import some_ from 'lodash/some';

import ypath from '../../common/thor/ypath';
import {isNull} from '../index';

export function hasTaskHistograms(operation: unknown) {
    const progress = ypath.getValue(operation, '/@progress');
    const tasks = isNull(progress) ? undefined : ypath.getValue(progress, '/tasks');
    return some_(tasks, ({estimated_input_data_weight_histogram, input_data_weight_histogram}) => {
        return (
            !isEmpty_(estimated_input_data_weight_histogram) ||
            !isEmpty_(input_data_weight_histogram)
        );
    });
}
