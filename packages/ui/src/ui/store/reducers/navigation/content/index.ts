import {combineReducers} from 'redux';

import mapNode from './map-node/map-node';
import table from './table/table';
import tableMountConfig from './table/table-mount-config';
import document from './document';
import file from './file';
import replicatedTable from './replicated-table';
import transaction from './transaction';
import transactionMap from './transaction-map/transaction-map';
import {downloadManager} from './table/download-manager';

export default combineReducers({
    downloadManager,
    replicatedTable,
    mapNode,
    table,
    tableMountConfig,
    document,
    file,
    transaction,
    transactionMap,
});
