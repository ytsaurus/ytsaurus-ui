import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import sortBy_ from 'lodash/sortBy';

import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getBatchError, splitBatchResults} from '../../../utils/utils';
import {USE_SUPRESS_SYNC} from '../../../../shared/constants';
import {loadSchedulersAndAgents} from './index';
import {changeMaintenance} from './masters';
import {getCurrentUserName} from '../../selectors/global';
import {getSystemAgents, getSystemSchedulers} from '../../selectors/system/schedulers';
import {getMastersHostType} from '../../selectors/settings';
import {VisibleHostType} from '../../../constants/system/masters';

export function getSchedulers() {
    return ytApiV3Id
        .list(YTApiId.systemSchedulers, {
            path: '//sys/scheduler/instances',
            attributes: ['annotations', 'maintenance', 'maintenance_message'],
            ...USE_SUPRESS_SYNC,
        })
        .then((hosts) => {
            const ordered = sortBy_(hosts, (host) => {
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

    forEach_(hosts, (host) => {
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
        const {outputs} = splitBatchResults(data, 'Failed to get scheduler states');
        const alerts = outputs[0];
        const connectedHosts = map_(hosts, (host, index) => {
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
    forEach_(hosts, (host) => {
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
        const {outputs} = splitBatchResults(data, 'Failed to get CA states');
        const agents = map_(hosts, (host, index) => ({
            host,
            connected: outputs[2 * index],
        }));
        const agentAlerts = reduce_(
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
            const res = sortBy_(hosts, (host) => {
                return ypath.getValue(host, '');
            });
            return getAgentsState(res);
        });
}

export const changeSchedulerMaintenance =
    ({address, maintenance, message, type}) =>
    async (dispatch, getSate) => {
        const state = getSate();
        const isAgent = type === 'agents';
        const items = isAgent ? getSystemAgents(state) : getSystemSchedulers(state);
        const hostType = getMastersHostType(state);

        const master = items.find((i) => {
            const host = i.host.$value;
            const annotations = ypath.getValue(i.host, '/@annotations');
            const addressByType =
                hostType === VisibleHostType.host ? host : annotations.physical_host;
            return addressByType === address;
        });

        if (!master) throw new Error('Cant find master by address');

        const login = getCurrentUserName(getSate());
        const result = await changeMaintenance({
            path: `//sys/${isAgent ? 'controller_agents' : 'scheduler'}/instances/${master.host.$value}`, //controller_agents
            login,
            maintenance,
            message,
        });

        const error = getBatchError(result, 'Failed to update master maintenance');
        if (error) {
            throw error;
        }

        dispatch(loadSchedulersAndAgents());
    };
