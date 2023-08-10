import each_ from 'lodash/each';
import reduce_ from 'lodash/reduce';
import sortBy_ from 'lodash/sortBy';
import values_ from 'lodash/values';

import {HttpProxiesState, ProxyInfo, RoleGroupInfo} from '../../store/reducers/system/proxies';

export function extractRoleGroups(proxies: Array<ProxyInfo>): Array<RoleGroupInfo> {
    const roleGroups = reduce_(
        proxies,
        (roles, proxy) => {
            const roleName = proxy.role || 'default';
            let role = roles[roleName];
            if (!role) {
                role = roles[roleName] = {
                    total: 0,
                    items: [],
                    name: roleName,
                    effectiveStates: {
                        online: 0,
                        offline: 0,
                        banned: 0,
                        alert: 0,
                        dec: 0,
                    },
                };
            }

            ++role.total;
            role.items.push(proxy);
            ++role.effectiveStates[proxy.effectiveState];

            return roles;
        },
        {} as Record<string, RoleGroupInfo>,
    );

    const roles = values_(roleGroups);

    return sortBy_(roles, 'name');
}

function incrementKeyCounter<K extends string>(counters: Record<K, number>, key: K) {
    counters[key] = counters[key] ?? 0;
    ++counters[key];
}

export function extractProxyCounters(proxies: Array<ProxyInfo>) {
    const counters: HttpProxiesState['counters'] = {
        total: proxies.length,
        states: {},
        effectiveStates: {},
        flags: {},
    };

    each_(proxies, (proxy) => {
        incrementKeyCounter(counters.states, proxy.state);
        incrementKeyCounter(counters.effectiveStates, proxy.effectiveState);
        if (proxy.effectiveState === 'banned') {
            incrementKeyCounter(counters.flags, 'banned');
        }
    });

    return counters;
}
