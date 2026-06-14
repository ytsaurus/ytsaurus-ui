import isEmpty_ from 'lodash/isEmpty';

import i18n from './i18n';

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

    if (isEmpty_(schedulers)) {
        tags.push({
            theme: 'default',
            label: i18n('alert_schedulers-unknown'),
        });
    } else if (schedulers.offline > 0 && schedulers.active === 0) {
        tags.push({
            theme: 'danger',
            label: i18n('alert_schedulers-down'),
        });
    } else if (schedulers.offline === 0 && schedulers.active === 0) {
        tags.push({
            theme: 'danger',
            label: i18n('alert_schedulers-standby'),
        });
    } else if (schedulers.active > 0 && schedulers.offline > 0) {
        tags.push({
            theme: 'warning',
            label: i18n('alert_schedulers-n-offline', {count: schedulers.offline}),
        });
    } else {
        const withAlerts = {
            theme: 'warning',
            label: i18n('alert_schedulers-ok-with-alerts', {count: schedulersAlertsLength}),
        };
        const withoutAlerts = {
            theme: 'success',
            label: i18n('alert_schedulers-ok'),
        };

        tags.push(schedulersAlertsLength > 0 ? withAlerts : withoutAlerts);
    }

    if (isEmpty_(agents)) {
        tags.push({
            theme: 'default',
            label: i18n('alert_agents-unknown'),
        });
    } else if (agents.total === agents.connected) {
        const withAlerts = {
            theme: 'warning',
            label: i18n('alert_agents-ok-with-alerts', {count: agentsAlertsLength}),
        };
        const withoutAlerts = {
            theme: 'success',
            label: i18n('alert_agents-ok'),
        };

        tags.push(agentsAlertsLength > 0 ? withAlerts : withoutAlerts);
    } else {
        let label = i18n('alert_agents-prefix');
        if (agents.connected) {
            label += ` ${i18n('value_connected', {count: agents.connected})}`;
        }
        if (agents.disconnected) {
            label += ` ${i18n('value_disconnected', {count: agents.disconnected})}`;
        }
        if (agents.offline) {
            label += ` ${i18n('value_offline', {count: agents.offline})}`;
        }

        tags.push({
            theme: agents.offline < 2 && agents.connected > 0 ? 'warning' : 'danger',
            label,
        });
    }

    return tags;
};
