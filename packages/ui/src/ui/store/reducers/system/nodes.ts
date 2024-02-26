import {Action} from 'redux';

import {YTError} from '../../../../@types/types';
import {CypressNode} from '../../../../shared/yt-types';
import {SYSTEM_FETCH_NODES} from '../../../constants/index';
import {ActionD} from '../../../types';
import {mergeStateOnClusterChange} from '../utils';
import type {HttpProxiesState, RoleGroupInfo} from './proxies';

export type SystemNodesState = {
    fetching: boolean;
    loaded: boolean;
    error: YTError | undefined;
    roleGroups: Record<string, Array<RoleGroupInfo>> | undefined;
    overviewCounters: HttpProxiesState['counters'] | undefined;
    counters: Record<string, HttpProxiesState['counters']> | undefined;
};

const initialState: SystemNodesState = {
    loaded: false,
    fetching: false,
    error: undefined,
    overviewCounters: undefined,
    counters: undefined,
    roleGroups: undefined,
};

export type SystemNodeInfo = CypressNode<
    {
        alert_count: number;
        banned: boolean;
        decommissioned: boolean;
        full: boolean;
        rack: string;
        state: NodeState;
    },
    string
>;

export type NodeState = 'online' | 'offline' | string;
export type NodeEffectiveState = 'other' | 'online' | 'offline';
export type NodeEffectiveFlag =
    | 'decommissioned'
    | 'full'
    | 'alerts'
    | 'banned'
    | 'alerts_online'
    | 'alerts_offline'
    | 'alerts_banned'
    | 'dec_online'
    | 'dec_offline'
    | 'dec_banned';
export type RackInfo = {
    name: string;
    empty: boolean;
    nodes: Array<
        SystemNodeInfo & {
            $attributes: {
                alerts: boolean;
                effectiveState: NodeEffectiveState;
                effectiveFlag?: NodeEffectiveFlag;
            };
        }
    >;
};

function nodes(state = initialState, action: SystemNodesAction): SystemNodesState {
    switch (action.type) {
        case SYSTEM_FETCH_NODES.REQUEST:
            return {...state, fetching: true};
        case SYSTEM_FETCH_NODES.SUCCESS:
            return {...state, ...action.data, loaded: true, fetching: true, error: undefined};
        case SYSTEM_FETCH_NODES.FAILURE:
            return {...state, fetching: false, error: action.data};
        default:
            return state;
    }
}

export type SystemNodesAction =
    | Action<typeof SYSTEM_FETCH_NODES.REQUEST>
    | ActionD<
          typeof SYSTEM_FETCH_NODES.SUCCESS,
          Pick<SystemNodesState, 'roleGroups' | 'counters' | 'overviewCounters'>
      >
    | ActionD<typeof SYSTEM_FETCH_NODES.FAILURE, SystemNodesState['error']>;

export default mergeStateOnClusterChange(initialState, {}, nodes);
