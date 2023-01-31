import _ from 'lodash';
import {createSelector} from 'reselect';

import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {VisibleHostType} from '../../../constants/system/masters';
import {getMastersHostType} from '../../../store/selectors/settings';

export const getSystemSchedulers = (state) => state.system.schedulersAndAgents.schedulers;
export const getSystemSchedulerAlerts = (state) => state.system.schedulersAndAgents.schedulerAlerts;
export const getSystemAgents = (state) => state.system.schedulersAndAgents.agents;
export const getSystemAgentAlerts = (state) => state.system.schedulersAndAgents.agentAlerts;
export const getSystemSchedulerAndAgentVisibleHostType = (state) =>
    state.system.schedulersAndAgents.hostType;

export const getSystemSchedulersWithState = createSelector(
    [getSystemSchedulers, getMastersHostType],
    (schedulers, hostType) => {
        const path = hostType === VisibleHostType.host ? '' : '/@annotations/physical_host';
        return _.map(schedulers, (sheduler) => {
            const res = connectedSchedulersToState(path, sheduler);
            return {
                ...res,
                maintenanceMessage: !ypath.getValue(sheduler, '/host/@maintenance')
                    ? undefined
                    : ypath.getValue(sheduler, '/host/@maintenance_message') || 'Maintenance',
            };
        });
    },
);

export const getSystemAgentsWithState = createSelector(
    [getSystemAgents, getMastersHostType],
    (agents, hostType) => {
        const path = hostType === VisibleHostType.host ? '' : '/@annotations/physical_host';
        return _.map(agents, (agent) => {
            const res = connectedAgentsToState(path, agent);
            return {
                ...res,
                maintenanceMessage: !ypath.getValue(agent, '/host/@maintenance')
                    ? undefined
                    : ypath.getValue(agent, '/host/@maintenance_message') || 'Maintenance',
            };
        });
    },
);

export const getSystemSchedulerAndAgentCounters = createSelector(
    [getSystemSchedulersWithState, getSystemAgentsWithState],
    (schedulersWithState, agentsWithState) => {
        return {
            schedulers: extractSchedulersCounters(schedulersWithState),
            agents: extractAgentsCounters(agentsWithState),
        };
    },
);

export const getSystemSchedulerAndAgentAlerts = createSelector(
    [getSystemSchedulerAlerts, getSystemAgentAlerts],
    (schedulerAlerts, agentAlerts) => {
        return {
            schedulers: schedulerAlerts,
            agents: agentAlerts,
        };
    },
);

function connectedSchedulersToState(path, connectedHost) {
    const {connected, host} = connectedHost;
    const state = typeof connected !== 'undefined' ? (connected ? 'active' : 'standby') : 'offline';
    return {host: ypath.getValue(host, path), state};
}

function connectedAgentsToState(path, connectedHost) {
    const {connected, host} = connectedHost;
    const state =
        typeof connected !== 'undefined' ? (connected ? 'connected' : 'disconnected') : 'offline';
    return {host: ypath.getValue(host, path), state};
}

const numberOf = (statefulHosts, state) => {
    return _.reduce(
        statefulHosts,
        (acc, host) => {
            return host.state === state ? acc + 1 : acc;
        },
        0,
    );
};

function extractSchedulersCounters(statefulHosts) {
    return {
        total: statefulHosts.length,
        active: numberOf(statefulHosts, 'active'),
        standby: numberOf(statefulHosts, 'standby'),
        offline: numberOf(statefulHosts, 'offline'),
    };
}

function extractAgentsCounters(statefulHosts) {
    return {
        total: statefulHosts.length,
        connected: numberOf(statefulHosts, 'connected'),
        disconnected: numberOf(statefulHosts, 'disconnected'),
        offline: numberOf(statefulHosts, 'offline'),
    };
}
