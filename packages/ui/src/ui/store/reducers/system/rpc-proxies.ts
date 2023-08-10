import {Action} from 'redux';
import {FETCH_RPC_PROXIES} from '../../../constants/system/nodes';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {HttpProxiesState} from './proxies';
import {ActionD} from '../../../types';

const initialState: HttpProxiesState = {
    fetching: false,
    loaded: false,
    error: undefined,
    roleGroups: [],
    counters: {total: 0, states: {}, effectiveStates: {}, flags: {}},
};

function rpcProxies(state = initialState, action: RpcProxiesAction): HttpProxiesState {
    switch (action.type) {
        case FETCH_RPC_PROXIES.REQUEST:
            return {...state, fetching: true};
        case FETCH_RPC_PROXIES.SUCCESS: {
            return {
                ...state,
                fetching: false,
                loaded: true,
                ...action.data,
            };
        }
        case FETCH_RPC_PROXIES.FAILURE:
            return {...state, fetching: false, error: action.data};
        default:
            return state;
    }
}

export type RpcProxiesAction =
    | Action<typeof FETCH_RPC_PROXIES.REQUEST>
    | ActionD<typeof FETCH_RPC_PROXIES.SUCCESS, Pick<HttpProxiesState, 'roleGroups' | 'counters'>>
    | ActionD<typeof FETCH_RPC_PROXIES.FAILURE, HttpProxiesState['error']>;

export default mergeStateOnClusterChange(initialState, {}, rpcProxies);
