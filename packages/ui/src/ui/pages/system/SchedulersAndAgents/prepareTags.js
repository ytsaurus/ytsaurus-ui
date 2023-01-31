import _ from 'lodash';

export default (counters, alerts) => {
    const tags = [];

    if (!counters || !alerts) {
        return tags;
    }

    const {schedulers, agents} = counters;
    const [schedulersAlertsLength, agentsAlertsLength] = [
        alerts.schedulers?.length || 0,
        alerts.agents?.length || 0,
    ];

    if (_.isEmpty(schedulers)) {
        tags.push({
            theme: 'default',
            label: 'Schedulers: unknown',
        });
    } else if (schedulers.offline > 0 && schedulers.active === 0) {
        tags.push({
            theme: 'danger',
            label: 'Schedulers: Down',
        });
    } else if (schedulers.offline === 0 && schedulers.active === 0) {
        tags.push({
            theme: 'danger',
            label: 'Schedulers: Standby',
        });
    } else if (schedulers.active > 0 && schedulers.offline > 0) {
        tags.push({
            theme: 'warning',
            label: `Schedulers: ${schedulers.offline} offline`,
        });
    } else {
        const withAlerts = {
            theme: 'warning',
            label: `Schedulers: OK (${schedulersAlertsLength} alerts)`,
        };
        const withoutAlerts = {
            theme: 'success',
            label: 'Schedulers: OK',
        };

        tags.push(schedulersAlertsLength > 0 ? withAlerts : withoutAlerts);
    }

    if (_.isEmpty(agents)) {
        tags.push({
            theme: 'default',
            label: 'Controller agents: unknown',
        });
    } else if (agents.total === agents.connected) {
        const withAlerts = {
            theme: 'warning',
            label: `Controller agents: OK (${agentsAlertsLength} alerts)`,
        };
        const withoutAlerts = {
            theme: 'success',
            label: 'Controller agents: OK',
        };

        tags.push(agentsAlertsLength > 0 ? withAlerts : withoutAlerts);
    } else {
        let label = 'Controller agents:';
        if (agents.connected) {
            label += ` ${agents.connected} connected`;
        }
        if (agents.disconnected) {
            label += ` ${agents.disconnected} disconnected`;
        }
        if (agents.offline) {
            label += ` ${agents.offline} offline`;
        }

        tags.push({
            theme: agents.offline < 2 && agents.connected > 0 ? 'warning' : 'danger',
            label,
        });
    }

    return tags;
};
