import _ from 'lodash';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {splitBatchResults} from '../../../utils/utils';
import {USE_SUPRESS_SYNC} from '../../../../shared/constants';

export function getSchedulers() {
    return ytApiV3Id
        .list(YTApiId.systemSchedulers, {
            path: '//sys/scheduler/instances',
            attributes: ['annotations', 'maintenance', 'maintenance_message'],
            ...USE_SUPRESS_SYNC,
        })
        .then((hosts) => {
            const ordered = _.sortBy(hosts, (host) => {
                return ypath.getValue(host, '');
            });
            return getSchedulersState(ordered);
        });
}

function getSchedulersState(hosts) {
    const requests = [
        {
            command: 'get',
            parameters: {
                path: '//sys/scheduler/@alerts',
                timeout: 10 * 1000,
                ...USE_SUPRESS_SYNC,
            },
        },
    ];

    _.forEach(hosts, (host) => {
        const name = ypath.getValue(host, '');
        requests.push({
            command: 'get',
            parameters: {
                path: '//sys/scheduler/instances/' + name + '/orchid/scheduler/service/connected',
                timeout: 10 * 1000,
                ...USE_SUPRESS_SYNC,
            },
        });
    });

    return ytApiV3Id.executeBatch(YTApiId.systemSchedulersState, {requests}).then((data) => {
        const {outputs} = splitBatchResults(data);
        const alerts = outputs[0];
        const connectedHosts = _.map(hosts, (host, index) => {
            return {
                host: host,
                connected: outputs[index + 1],
            };
        });
        return {schedulers: connectedHosts, schedulerAlerts: alerts};
    });
}

function getAgentsState(hosts) {
    const requests = [];
    _.forEach(hosts, (host) => {
        const basePath = '//sys/controller_agents/instances/' + ypath.getValue(host, '');

        requests.push(
            {
                command: 'get',
                parameters: {
                    path: basePath + '/orchid/controller_agent/service/connected',
                    timeout: 10 * 1000,
                    ...USE_SUPRESS_SYNC,
                },
            },
            {
                command: 'get',
                parameters: {
                    path: basePath + '/@alerts',
                    timeout: 10 * 1000,
                    ...USE_SUPRESS_SYNC,
                },
            },
        );
    });

    return ytApiV3Id.executeBatch(YTApiId.systemCAStates, {requests}).then((data) => {
        const {outputs} = splitBatchResults(data);
        const agents = _.map(hosts, (host, index) => ({
            host,
            connected: outputs[2 * index],
        }));
        const agentAlerts = _.reduce(
            outputs,
            (alerts, value, index) => {
                if (index % 2) {
                    return alerts.concat(value);
                }
                return alerts;
            },
            [],
        );

        return {agents, agentAlerts};
    });
}

export function getAgents() {
    return ytApiV3Id
        .list(YTApiId.systemCAInstances, {
            path: '//sys/controller_agents/instances',
            attributes: ['annotations', 'maintenance', 'maintenance_message'],
            ...USE_SUPRESS_SYNC,
        })
        .then((hosts) => {
            hosts = hosts || [];
            const res = _.sortBy(hosts, (host) => {
                return ypath.getValue(host, '');
            });
            return getAgentsState(res);
        });
}
