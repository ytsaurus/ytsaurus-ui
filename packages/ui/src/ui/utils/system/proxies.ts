import each_ from 'lodash/each';
import reduce_ from 'lodash/reduce';
import sortBy_ from 'lodash/sortBy';
import values_ from 'lodash/values';

import type {
    HttpProxiesState,
    RoleGroupInfo,
    RoleGroupItemInfo,
    SystemNodeCounters,
} from '../../store/reducers/system/proxies';
import type {NodeEffectiveState, NodeState} from '../../store/reducers/system/nodes';

export function extractRoleGroups(proxies: Array<RoleGroupItemInfo>): Array<RoleGroupInfo> {
    const roleGroups = reduce_(
        proxies,
        (roles, proxy) => {
            const roleName = proxy.role || 'default';
            let role = roles[roleName];
            if (!role) {
                role = roles[roleName] = {
                    items: [],
                    name: roleName,
                    counters: {
                        total: 0,
                        states: {},
                        effectiveStates: {},
                        flags: {},
                    },
                };
            }

            ++role.counters.total;
            incrementCounters(proxy, role.counters);
            return roles;
        },
        {} as Record<string, RoleGroupInfo>,
    );

    const roles = values_(roleGroups);

    return sortBy_(roles, 'name');
}

const MAIN_STATES = new Set<NodeEffectiveState>(['online', 'offline']);
export function getNodeffectiveState(state: NodeState): NodeEffectiveState {
    return MAIN_STATES.has(state as any) ? (state as NodeEffectiveState) : 'other';
}

export function incrementStateCounter<K extends string>(
    counters: Partial<Record<K, number>>,
    k?: K,
) {
    if (!k) {
        return;
    }

    if (counters[k] === undefined) {
        counters[k] = 1;
    } else {
        ++counters[k]!;
    }
}

export function extractProxyCounters(proxies: Array<RoleGroupItemInfo>) {
    const counters: HttpProxiesState['counters'] = {
        total: proxies.length,
        states: {},
        effectiveStates: {},
        flags: {},
    };

    each_(proxies, (proxy) => {
        incrementCounters(proxy, counters);
    });

    return counters;
}

function incrementCounters(proxy: RoleGroupItemInfo, counters: SystemNodeCounters) {
    incrementStateCounter(counters.states, proxy.state);
    incrementStateCounter(counters.effectiveStates, proxy.effectiveState);
    if (proxy.banned) {
        incrementStateCounter(counters.flags, 'banned');
    }
}
