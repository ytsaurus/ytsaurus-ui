import {Action} from 'redux';
import {YTError} from '../../../../@types/types';
import {FETCH_PROXIES} from '../../../constants/system/nodes';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {ActionD} from '../../../types';
import {NodeEffectiveFlag, NodeEffectiveState, NodeState} from './nodes';

export type SystemNodeCounters = {
    total: number;
    states: Record<NodeState, number>;
    effectiveStates: Partial<Record<NodeEffectiveState, number>>;
    flags: Partial<Record<NodeEffectiveFlag, number>>;
};

export type HttpProxiesState = {
    fetching: boolean;
    loaded: boolean;
    error?: YTError;
    roleGroups: Array<RoleGroupInfo>;
    counters: SystemNodeCounters;
};

export type RoleGroupInfo = {
    name: string;
    items: Array<RoleGroupItemInfo>;
    counters: SystemNodeCounters;
};

const initialState: HttpProxiesState = {
    fetching: false,
    loaded: false,
    error: undefined,
    roleGroups: [],
    counters: {total: 0, states: {}, effectiveStates: {}, flags: {}},
};

export type RoleGroupItemInfo = {
    name: string;
    state: NodeState;
    effectiveState: NodeEffectiveState;
    role: string;
    banned: boolean;
    decommissioned?: boolean;
    alerts?: boolean;
    alert_count?: number;
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
