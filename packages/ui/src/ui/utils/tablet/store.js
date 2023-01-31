import ypath from '@ytsaurus/interface-helpers/lib/ypath';

export default class Store {
    constructor(data) {
        this.$value = data.$value;
        this.$attributes = data.$attributes;

        this.rowCount = Number(ypath.getValue(this.$attributes, '/row_count'));
        this.storeState = ypath.getValue(this.$attributes, '/store_state');

        // Dynamic
        this.poolSize = Number(ypath.getValue(this.$attributes, '/pool_size'));
        this.poolCapacity = Number(ypath.getValue(this.$attributes, '/pool_capacity'));
        this.lockCount = Number(ypath.getValue(this.$attributes, '/lock_count'));
        this.valueCount = Number(ypath.getValue(this.$attributes, '/value_count'));
        this.flushState = ypath.getValue(this.$attributes, '/flush_state');

        // Persistent
        this.uncompressed = Number(ypath.getValue(this.$attributes, '/uncompressed_data_size'));
        this.compressed = Number(ypath.getValue(this.$attributes, '/compressed_data_size'));
        this.compactionState = ypath.getValue(this.$attributes, '/compaction_state');
        this.preloadState = ypath.getValue(this.$attributes, '/preload_state');
    }
}
