import _ from 'lodash';
import ypath from '../../common/thor/ypath';

export function hasTaskHistograms(operation: unknown) {
    const tasks = ypath.getValue(operation, '/@progress/tasks');
    return _.some(tasks, ({estimated_input_data_weight_histogram, input_data_weight_histogram}) => {
        return (
            !_.isEmpty(estimated_input_data_weight_histogram) ||
            !_.isEmpty(input_data_weight_histogram)
        );
    });
}
