import {Action} from 'redux';
import {FETCH_PROXIES} from '../../../constants/system/nodes';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {YTError} from '../../../../@types/types';
import {ActionD} from '../../../types';

export type HttpProxiesState = {
    fetching: boolean;
    loaded: boolean;
    error?: YTError;
    roleGroups: Array<RoleGroupInfo>;
    counters: {
        total: number;
        states: Record<string, number>;
        effectiveStates: Record<string, number>;
        flags: Record<string, number>;
    };
};

export type RoleGroupInfo = {
    name: string;
    items: Array<ProxyInfo>;
    total: number;
    effectiveStates: {
        online: number;
        offline: number;
        banned: number;
        alert: number;
        dec: number;
    };
};

const initialState: HttpProxiesState = {
    fetching: false,
    loaded: false,
    error: undefined,
    roleGroups: [],
    counters: {total: 0, states: {}, effectiveStates: {}, flags: {}},
};

export type ProxyInfo = {
    name: string;
    state: 'offline' | 'online';
    effectiveState: 'banned' | ProxyInfo['state'];
    role: string;
};

function proxies(state = initialState, action: HttpProxiesAction): HttpProxiesState {
    switch (action.type) {
        case FETCH_PROXIES.REQUEST:
            return {...state, fetching: true};
        case FETCH_PROXIES.SUCCESS: {
            return {
                ...state,
                fetching: false,
                error: undefined,
                loaded: true,
                ...action.data,
            };
        }
        case FETCH_PROXIES.FAILURE:
            return {...state, fetching: false, error: action.data};
        default:
            return state;
    }
}

export type HttpProxiesAction =
    | Action<typeof FETCH_PROXIES.REQUEST>
    | ActionD<typeof FETCH_PROXIES.FAILURE, HttpProxiesState['error']>
    | ActionD<typeof FETCH_PROXIES.SUCCESS, Pick<HttpProxiesState, 'roleGroups' | 'counters'>>;

export default mergeStateOnClusterChange(initialState, {}, proxies);
