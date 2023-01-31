import _ from 'lodash';
import PropTypes from 'prop-types';

export const roleGroupStructure = PropTypes.shape({
    name: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    total: PropTypes.number.isRequired,
});

export function extractRpcProxy(data) {
    return _.reduce(
        data,
        (acc, value, key) => {
            acc.push({
                name: key,
                role: value.$attributes?.role,
                state: value.$value?.alive || value?.alive ? 'online' : 'offline',
                effectiveState: value.$value?.alive || value?.alive ? 'online' : 'offline',
            });
            return acc;
        },
        [],
    );
}

export function extractRoleGroups(proxies) {
    const roleGroups = _.reduce(
        proxies,
        (roles, proxy) => {
            const roleName = proxy.role || 'default';
            const role = (roles[roleName] = roles[roleName] || {
                total: 0,
                items: [],
                name: roleName,
            });
            role.total++;
            role.items.push(proxy);

            return roles;
        },
        {},
    );

    const roles = _.values(roleGroups);

    return _.sortBy(roles, 'name');
}

function incrementStateCounters(counters, name, proxy) {
    const state = proxy[name];
    const stateCounters = counters[name + 's'];
    stateCounters[state] = stateCounters[state] || 0;
    stateCounters[state]++;
}

export function extractProxyCounters(proxies) {
    const counters = {
        total: proxies.length,
        states: {},
        effectiveStates: {},
    };

    _.each(proxies, (proxy) => {
        incrementStateCounters(counters, 'state', proxy);
        incrementStateCounters(counters, 'effectiveState', proxy);
    });

    return counters;
}
