export const partitionsTableItems = {
    index: {
        sort: true,
        caption: '#',
        align: 'right',
        get(partition) {
            return partition.index;
        },
    },
    state: {
        align: 'center',
        sort(partition) {
            return {
                normal: 0,
                splitting: 1,
                merging: 2,
                compacting: 3,
                sampling: 4,
                partitioning: 5,
            }[partition.state];
        },
        get(partition) {
            return partition.state;
        },
    },
    unmerged_row_count: {
        sort: true,
        align: 'right',
        get(partition) {
            return partition.unmergedRows;
        },
    },
    uncompressed_data_size: {
        sort: true,
        align: 'right',
        get(partition) {
            return partition.uncompressed;
        },
    },
    compressed_data_size: {
        sort: true,
        align: 'right',
        get(partition) {
            return partition.compressed;
        },
    },
    store_count: {
        sort: true,
        align: 'right',
        get(partition) {
            return partition.storeCount;
        },
    },
    sample_key_count: {
        sort: true,
        align: 'right',
        get(partition) {
            return partition.sampleKeyCount;
        },
    },
    pivot_key: {
        sort: false,
        align: 'left',
        get(partition) {
            return partition.pivotKey;
        },
    },
    actions: {
        caption: '',
        align: 'right',
        sort: false,
    },
};

export const storesTableItems = {
    id: {
        align: 'left',
        show: true,
        sort(store) {
            return store.$value;
        },
        get(store) {
            return store.$value;
        },
    },
    store_state: {
        align: 'center',
        sort: true,
        show: true,
        get(store) {
            return store.storeState;
        },
    },
    row_count: {
        align: 'left',
        sort: true,
        show: true,
        get(store) {
            return store.rowCount;
        },
    },
    attributes: {
        caption: '',
        align: 'left',
        sort: false,
    },
};
