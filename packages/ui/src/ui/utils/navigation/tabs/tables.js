import ypath from '../../../common/thor/ypath';
import {getStorePreloadValues} from '../../../utils/navigation/tabs/tablets';
import {DESC_ASC_UNORDERED} from '../../sort-helpers';

export const tableItems = {
    name_tablet_id: {
        caption: 'Node / Tablet id',
        sort(item) {
            return item.name;
        },
    },
    name_cell_id: {
        caption: 'Cell id / Tablet id',
        sort(item) {
            return item.name;
        },
    },
    index: {
        sort: true,
        caption: 'Tablet index',
        align: 'left',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/index'));
        },
    },
    tablet_id: {
        sort: true,
        align: 'left',
        get(tablet) {
            return ypath.getValue(tablet, '/tablet_id');
        },
    },
    cell_leader_address: {
        sort: true,
        align: 'left',
        caption: 'Node',
        get(item) {
            return ypath.getValue(item, '/cell_leader_address');
        },
    },
    state: {
        sort: true,
        align: 'center',
        get(tablet) {
            return ypath.getValue(tablet, '/state');
        },
    },
    cell_id: {
        sort: true,
        align: 'left',
        get(tablet) {
            return ypath.getValue(tablet, '/cell_id');
        },
    },
    error_count: {
        sort: true,
        align: 'center',
        get(tablet) {
            return ypath.getNumberDeprecated(tablet, '/error_count', NaN);
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        overall: 'sum',
    },
    replication_error_count: {
        sort: true,
        align: 'center',
        get(tablet) {
            return ypath.getNumberDeprecated(tablet, '/replication_error_count', NaN);
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        overall: 'sum',
    },
    pivot_key: {
        sort: false,
        align: 'left',
        caption: 'Pivot Key',
        get(tablet) {
            return ypath.getValue(tablet, '/pivot_key');
        },
    },
    // Structure
    chunk_count: {
        sort: true,
        align: 'right',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/chunk_count'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    partition_count: {
        sort: true,
        align: 'right',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/partition_count'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    store_count: {
        sort: true,
        align: 'right',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/store_count'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    overlapping_store_count: {
        sort: true,
        align: 'right',
        overall: 'max',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/overlapping_store_count'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    store_preload: {
        align: 'center',
        sort(tablet) {
            const storePreload = getStorePreloadValues(tablet);
            const completed = storePreload.completed;
            const failed = storePreload.failed;
            const pending = storePreload.pending;
            const total = completed + failed + pending;

            return [total > 0 ? completed / total : 0, total > 0 ? failed / total : 0, total];
        },
        overall(aggregation, tablet, name) {
            const aggregatedStorePreload = (aggregation[name] = aggregation[name] || {
                completed: 0,
                failed: 0,
                pending: 0,
            });
            const currentStorePreload = tablet[name];

            aggregatedStorePreload.completed += currentStorePreload.completed;
            aggregatedStorePreload.failed += currentStorePreload.failed;
            aggregatedStorePreload.pending += currentStorePreload.pending;
        },
        get(tablet) {
            return getStorePreloadValues(tablet);
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    // Data
    unmerged_row_count: {
        sort: true,
        align: 'center',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/unmerged_row_count'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    uncompressed_data_size: {
        sort: true,
        align: 'center',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/uncompressed_data_size'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    compressed_data_size: {
        sort: true,
        align: 'center',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/compressed_data_size'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    disk_space: {
        sort: true,
        align: 'center',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/disk_space'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    // Performance
    static_chunk: {
        group: true,
        items: {
            read: {
                sort: true,
                align: 'right',
                overall: 'sum',
                get(tablet) {
                    return Number(
                        ypath.getValue(tablet, '/performance_counters/static_chunk_row_read_rate'),
                    );
                },
                allowedOrderTypes: DESC_ASC_UNORDERED,
            },
            lookup: {
                sort: true,
                align: 'right',
                overall: 'sum',
                get(tablet) {
                    return Number(
                        ypath.getValue(
                            tablet,
                            '/performance_counters/static_chunk_row_lookup_rate',
                        ),
                    );
                },
                allowedOrderTypes: DESC_ASC_UNORDERED,
            },
        },
        set: ['read', 'lookup'],
    },
    dynamic: {
        group: true,
        items: {
            read: {
                sort: true,
                align: 'right',
                overall: 'sum',
                get(tablet) {
                    return Number(
                        ypath.getValue(tablet, '/performance_counters/dynamic_row_read_rate'),
                    );
                },
                allowedOrderTypes: DESC_ASC_UNORDERED,
            },
            lookup: {
                sort: true,
                align: 'right',
                overall: 'sum',
                get(tablet) {
                    return Number(
                        ypath.getValue(tablet, '/performance_counters/dynamic_row_lookup_rate'),
                    );
                },
                allowedOrderTypes: DESC_ASC_UNORDERED,
            },
            write: {
                sort: true,
                align: 'right',
                overall: 'sum',
                get(tablet) {
                    return Number(
                        ypath.getValue(tablet, '/performance_counters/dynamic_row_write_rate'),
                    );
                },
                allowedOrderTypes: DESC_ASC_UNORDERED,
            },
            delete: {
                sort: true,
                align: 'right',
                overall: 'sum',
                get(tablet) {
                    return Number(
                        ypath.getValue(tablet, '/performance_counters/dynamic_row_delete_rate'),
                    );
                },
                allowedOrderTypes: DESC_ASC_UNORDERED,
            },
        },
        set: ['read', 'lookup', 'write', 'delete'],
    },
    unmerged_row_read_rate: {
        sort: true,
        align: 'right',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/performance_counters/unmerged_row_read_rate'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    merged_row_read_rate: {
        sort: true,
        align: 'right',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/performance_counters/merged_row_read_rate'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    actions: {
        align: 'right',
        caption: '',
    },
};

export const histogramItems = {
    unmerged_row_count: {
        format: 'Number',
    },
    uncompressed_data_size: {
        dataName: 'bytes',
        format: 'Bytes',
    },
    compressed_data_size: {
        dataName: 'bytes',
        format: 'Bytes',
    },
    store_count: {
        format: 'Number',
    },
    partition_count: {
        format: 'Number',
    },
    chunk_count: {
        format: 'Number',
    },
    static_chunk_read: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['static_chunk'].items['read'].get(tablet);
        },
    },
    static_chunk_lookup: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['static_chunk'].items['lookup'].get(tablet);
        },
    },
    unmerged_row_read_rate: {
        dataName: 'rows/s',
        format: 'Number',
    },
    merged_row_read_rate: {
        dataName: 'rows/s',
        format: 'Number',
    },
    dynamic_row_read_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['dynamic'].items['read'].get(tablet);
        },
    },
    dynamic_row_lookup_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['dynamic'].items['lookup'].get(tablet);
        },
    },
    dynamic_row_write_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['dynamic'].items['write'].get(tablet);
        },
    },
    dynamic_row_delete_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['dynamic'].items['delete'].get(tablet);
        },
    },
};
