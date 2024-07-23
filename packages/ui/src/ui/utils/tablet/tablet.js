import extend_ from 'lodash/extend';
import map_ from 'lodash/map';

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
    const partitions = map_(contents.partitions, (partition, index) => {
        partition.attributes = Object.assign({}, partition);
        partition.index = index;
        return new Partition(partition);
    });

    const eden = new Partition(
        extend_(
            {
                isEden: true,
                index: -1,
                attributes: extend_({}, contents.eden),
            },
            contents.eden,
        ),
    );

    partitions.unshift(eden);

    return partitions;
}
