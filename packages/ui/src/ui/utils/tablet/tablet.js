import extend_ from 'lodash/extend';
import map_ from 'lodash/map';

import Partition from '../../utils/tablet/partition';
import i18n from './i18n';

export const histogramItems = {
    unmerged_row_count: {
        format: 'Number',
        get title() {
            return i18n('field_unmerged-rows');
        },
    },
    uncompressed_data_size: {
        dataName: 'bytes',
        format: 'Bytes',
        get title() {
            return i18n('field_uncompressed-data-size');
        },
    },
    store_count: {
        format: 'Number',
        get title() {
            return i18n('field_stores');
        },
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
