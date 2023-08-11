import {Action} from 'redux';

import {SYSTEM_FETCH_NODES} from '../../../constants/index';
import {mergeStateOnClusterChange} from '../utils';
import {YTError} from '../../../../@types/types';
import {ActionD} from '../../../types';
import type {HttpProxiesState} from './proxies';
import {CypressNode} from '../../../../shared/yt-types';

export type SystemNodesState = {
    fetching: boolean;
    loaded: boolean;
    error: YTError | undefined;
    rackGroups: Record<string, Array<RackInfo>> | undefined;
    overviewCounters: HttpProxiesState['counters'] | undefined;
    counters: Record<string, HttpProxiesState['counters']> | undefined;
};

const initialState: SystemNodesState = {
    loaded: false,
    fetching: false,
    error: undefined,
    overviewCounters: undefined,
    counters: undefined,
    rackGroups: undefined,
};

export type SystemNodeInfo = CypressNode<
    {
        alert_count: number;
        banned: boolean;
        decomissioned: boolean;
        full: boolean;
        rack: string;
        state: NodeState;
    },
    string
>;

type NodeState = 'online' | 'offline';
type NodeEffectiveState = 'banned' | NodeState;
type NodeEffectiveFlag = 'decomissioned' | 'full' | 'alerts' | '';

export type RackInfo = {
    name: string;
    empty: boolean;
    nodes: Array<
        SystemNodeInfo & {
            $attributes: {
                alerts: boolean;
                effectiveState: NodeEffectiveState;
                effectiveFlag: NodeEffectiveFlag;
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
          Pick<SystemNodesState, 'rackGroups' | 'counters' | 'overviewCounters'>
      >
    | ActionD<typeof SYSTEM_FETCH_NODES.FAILURE, SystemNodesState['error']>;

export default mergeStateOnClusterChange(initialState, {}, nodes);
