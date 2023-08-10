import {FETCH_RPC_PROXIES} from '../../../store/actions/system/rpc-proxies';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    extractProxyCounters,
    extractRoleGroups,
    extractRpcProxy,
} from '../../../utils/system/proxies';

const initialState = {
    fetching: false,
    error: null,
    roleGroups: [],
    counters: {},
};

function rpcProxies(state = initialState, action) {
    switch (action.type) {
        case FETCH_RPC_PROXIES.REQUEST:
            return {...state, fetching: true};
        case FETCH_RPC_PROXIES.SUCCESS: {
            const rpcProxies = extractRpcProxy(action.data);
            return {
                ...state,
                fetching: false,
                roleGroups: extractRoleGroups(rpcProxies),
                counters: extractProxyCounters(rpcProxies),
            };
        }
        case FETCH_RPC_PROXIES.FAILURE:
            return {...state, fetching: false, error: action.data};
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, rpcProxies);
