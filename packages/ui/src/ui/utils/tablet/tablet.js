import _ from 'lodash';
import Partition from '../../utils/tablet/partition';

export const histogramItems = {
    unmerged_row_count: {
        format: 'Number',
    },
    uncompressed_data_size: {
        dataName: 'bytes',
        format: 'Bytes',
    },
    store_count: {
        format: 'Number',
    },
};

export function preparePartitions(contents) {
    const partitions = _.map(contents.partitions, (partition, index) => {
        partition.attributes = _.assign({}, partition);
        partition.index = index;
        return new Partition(partition);
    });

    const eden = new Partition(
        _.extend(
            {
                isEden: true,
                index: -1,
                attributes: _.extend({}, contents.eden),
            },
            contents.eden,
        ),
    );

    partitions.unshift(eden);

    return partitions;
}
