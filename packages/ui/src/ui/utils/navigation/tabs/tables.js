import ypath from '../../../common/thor/ypath';
import {getStorePreloadValues} from '../../../utils/navigation/tabs/tablets';
import {DESC_ASC_UNORDERED} from '../../sort-helpers';
import i18n from './i18n';

export const tableItems = {
    name_tablet_id: {
        get caption() {
            return i18n('field_node-tablet-id');
        },
        sort(item) {
            return item.name;
        },
    },
    name_cell_id: {
        get caption() {
            return i18n('field_cell-tablet-id');
        },
        sort(item) {
            return item.name;
        },
    },
    index: {
        sort: true,
        get caption() {
            return i18n('field_tablet-index');
        },
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
        get caption() {
            return i18n('field_tablet-id');
        },
    },
    cell_leader_address: {
        sort: true,
        align: 'left',
        get caption() {
            return i18n('field_node');
        },
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
        get caption() {
            return i18n('field_state');
        },
    },
    cell_id: {
        sort: true,
        align: 'left',
        get(tablet) {
            return ypath.getValue(tablet, '/cell_id');
        },
        get caption() {
            return i18n('field_cell-id');
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
        get caption() {
            return i18n('field_errors');
        },
    },
    replication_error_count: {
        sort: true,
        align: 'center',
        get(tablet) {
            return ypath.getNumberDeprecated(tablet, '/replication_error_count', NaN);
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        overall: 'sum',
        get caption() {
            return i18n('field_replication-errors');
        },
    },
    replication_lag_time: {
        align: 'right',
        get caption() {
            return i18n('field_replication-lag');
        },
        get(tablet) {
            return ypath.getNumberDeprecated(tablet, '/replication_lag_time', undefined);
        },
        sort: true,
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    replication_mode: {
        align: 'center',
        get caption() {
            return i18n('field_replication-mode');
        },
        get(tablet) {
            return ypath.getValue(tablet, '/replication_mode');
        },
        sort: true,
        allowedOrderTypes: DESC_ASC_UNORDERED,
    },
    pivot_key: {
        sort: false,
        align: 'left',
        get caption() {
            return i18n('field_pivot-key');
        },
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
        get caption() {
            return i18n('field_chunks');
        },
    },
    partition_count: {
        sort: true,
        align: 'right',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/partition_count'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        get caption() {
            return i18n('field_partitions');
        },
    },
    store_count: {
        sort: true,
        align: 'right',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/store_count'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        get caption() {
            return i18n('field_stores');
        },
    },
    overlapping_store_count: {
        sort: true,
        align: 'right',
        overall: 'max',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/overlapping_store_count'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        get caption() {
            return i18n('field_overlapping-stores');
        },
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
        get caption() {
            return i18n('field_store-preload');
        },
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
        get caption() {
            return i18n('field_unmerged-rows');
        },
    },
    uncompressed_data_size: {
        sort: true,
        align: 'center',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/uncompressed_data_size'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        get caption() {
            return i18n('field_uncompressed-data-size');
        },
    },
    compressed_data_size: {
        sort: true,
        align: 'center',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/compressed_data_size'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        get caption() {
            return i18n('field_compressed-data-size');
        },
    },
    disk_space: {
        sort: true,
        align: 'center',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/statistics/disk_space'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        get caption() {
            return i18n('field_disk-space');
        },
    },
    // Performance
    static_chunk: {
        group: true,
        get caption() {
            return i18n('field_static-chunk');
        },
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
                get caption() {
                    return i18n('field_read');
                },
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
                get caption() {
                    return i18n('field_lookup');
                },
            },
        },
        set: ['read', 'lookup'],
    },
    dynamic: {
        group: true,
        get caption() {
            return i18n('field_dynamic');
        },
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
                get caption() {
                    return i18n('field_read');
                },
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
                get caption() {
                    return i18n('field_lookup');
                },
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
                get caption() {
                    return i18n('field_write');
                },
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
                get caption() {
                    return i18n('field_delete');
                },
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
        get caption() {
            return i18n('field_unmerged-row-read-rate');
        },
    },
    merged_row_read_rate: {
        sort: true,
        align: 'right',
        overall: 'sum',
        get(tablet) {
            return Number(ypath.getValue(tablet, '/performance_counters/merged_row_read_rate'));
        },
        allowedOrderTypes: DESC_ASC_UNORDERED,
        get caption() {
            return i18n('field_merged-row-read-rate');
        },
    },
    actions: {
        align: 'right',
        caption: '',
    },
};

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
    compressed_data_size: {
        dataName: 'bytes',
        format: 'Bytes',
        get title() {
            return i18n('field_compressed-data-size');
        },
    },
    store_count: {
        format: 'Number',
        get title() {
            return i18n('field_stores');
        },
    },
    partition_count: {
        format: 'Number',
        get title() {
            return i18n('field_partitions');
        },
    },
    chunk_count: {
        format: 'Number',
        get title() {
            return i18n('field_chunks');
        },
    },
    overlapping_store_count: {
        format: 'Number',
        get title() {
            return i18n('field_overlapping-stores');
        },
    },
    static_chunk_read: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['static_chunk'].items['read'].get(tablet);
        },
        get title() {
            return i18n('field_static-chunk-read');
        },
    },
    static_chunk_lookup: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['static_chunk'].items['lookup'].get(tablet);
        },
        get title() {
            return i18n('field_static-chunk-lookup');
        },
    },
    unmerged_row_read_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get title() {
            return i18n('field_unmerged-row-read-rate');
        },
    },
    merged_row_read_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get title() {
            return i18n('field_merged-row-read-rate');
        },
    },
    dynamic_row_read_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['dynamic'].items['read'].get(tablet);
        },
        get title() {
            return i18n('field_dynamic-row-read-rate');
        },
    },
    dynamic_row_lookup_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['dynamic'].items['lookup'].get(tablet);
        },
        get title() {
            return i18n('field_dynamic-row-lookup-rate');
        },
    },
    dynamic_row_write_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['dynamic'].items['write'].get(tablet);
        },
        get title() {
            return i18n('field_dynamic-row-write-rate');
        },
    },
    dynamic_row_delete_rate: {
        dataName: 'rows/s',
        format: 'Number',
        get(tablet) {
            return tableItems['dynamic'].items['delete'].get(tablet);
        },
        get title() {
            return i18n('field_dynamic-row-delete-rate');
        },
    },
};
