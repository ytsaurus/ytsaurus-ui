import i18n from './i18n';

export const proxiesTableColumnItems = {
    host: {
        get caption() {
            return i18n('field_host');
        },
        get(proxy) {
            return proxy.host;
        },
        sort: true,
        align: 'left',
    },
    state: {
        get caption() {
            return i18n('field_state');
        },
        get(proxy) {
            return proxy.state;
        },
        sort: true,
        align: 'center',
    },
    role: {
        get caption() {
            return i18n('field_role');
        },
        get(proxy) {
            return proxy.role;
        },
        sort: true,
        align: 'left',
    },
    version: {
        get caption() {
            return i18n('field_version');
        },
        get(proxy) {
            return proxy.version;
        },
        sort: true,
        align: 'left',
    },
    banned: {
        get(proxy) {
            return Boolean(proxy.banned);
        },
        sort: true,
        get caption() {
            return i18n('field_banned-caption');
        },
        align: 'center',
        get tooltipProps() {
            return {placement: 'bottom', content: i18n('field_banned')};
        },
    },
    load_average: {
        get caption() {
            return i18n('field_load-average');
        },
        get(proxy) {
            return proxy.loadAverage;
        },
        sort: true,
        align: 'right',
    },
    updated_at: {
        get caption() {
            return i18n('field_updated-at');
        },
        get(proxy) {
            return proxy.updatedAt;
        },
        sort: true,
        align: 'right',
    },
    network_load: {
        get caption() {
            return i18n('field_network-load');
        },
        get(proxy) {
            return proxy.networkLoad;
        },
        sort: true,
        align: 'right',
    },
    actions: {
        get(proxy) {
            return proxy.host;
        },
        sort: false,
        caption: '',
        align: 'right',
    },
};
