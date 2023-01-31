import {combineReducers} from 'redux';

import masters from './masters';
import chunks from './chunks';
import resources from './resources';
import schedulersAndAgents from './schedulers';
import proxies from './proxies';
import nodes from './nodes';
import rpcProxies from './rpc-proxies';

export default combineReducers({
    schedulersAndAgents,
    proxies,
    rpcProxies,
    chunks,
    resources,
    masters,
    nodes,
});
