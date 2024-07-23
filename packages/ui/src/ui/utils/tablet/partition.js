import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import keys_ from 'lodash/keys';

export default class Partition {
    constructor(data) {
        this.$value = data.index;
        this.$attributes = data;

        this.index = data.index;
        this.pivotKey = ypath.getValue(data, '/pivot_key');
        this.isEden = ypath.getValue(data, '/isEden');

        this.state = ypath.getValue(data, '/state');
        this.compressed = Number(ypath.getValue(data, '/compressed_data_size'));
        this.uncompressed = Number(ypath.getValue(data, '/uncompressed_data_size'));
        this.unmergedRows = Number(ypath.getValue(data, '/unmerged_row_count'));
        this.sampleKeyCount = Number(ypath.getValue(data, '/sample_key_count'));

        let stores = ypath.getValue(data, '/stores');
        stores = stores ? keys_(stores) : [];

        this.stores = stores;
        this.storeCount = stores.length;
    }
}
