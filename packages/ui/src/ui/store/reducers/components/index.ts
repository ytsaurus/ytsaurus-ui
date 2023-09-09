import {combineReducers} from 'redux';

import versionsV2 from './versions/versions_v2';
import nodes from './nodes';
import node from './node';
import proxies from './proxies';
import shards from './shards';
import nodeMaintenanceModal from './node-maintenance-modal';

export default combineReducers({
    versionsV2,
    nodes,
    node,
    proxies,
    shards,
    nodeMaintenanceModal,
});
