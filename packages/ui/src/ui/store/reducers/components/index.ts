import {combineReducers} from 'redux';

import banUnban from './ban-unban';
import versions from './versions';
import versionsV2 from './versions/versions_v2';
import nodes from './nodes';
import node from './node';
import proxies from './proxies';
import shards from './shards';
import decommission from './decommission';

export default combineReducers({
    banUnban,
    decommission,
    versions,
    versionsV2,
    nodes,
    node,
    proxies,
    shards,
});
