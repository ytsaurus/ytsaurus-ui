import isEmpty_ from 'lodash/isEmpty';
import some_ from 'lodash/some';

import ypath from '../../common/thor/ypath';

export function hasTaskHistograms(operation: unknown) {
    const tasks = ypath.getValue(operation, '/@progress/tasks');
    return some_(tasks, ({estimated_input_data_weight_histogram, input_data_weight_histogram}) => {
        return (
            !isEmpty_(estimated_input_data_weight_histogram) ||
            !isEmpty_(input_data_weight_histogram)
        );
    });
}
