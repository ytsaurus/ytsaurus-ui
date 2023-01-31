export const proxiesTableColumnItems = {
    host: {
        get(proxy) {
            return proxy.host;
        },
        sort: true,
        align: 'left',
    },
    state: {
        get(proxy) {
            return proxy.state;
        },
        sort: true,
        align: 'center',
    },
    role: {
        get(proxy) {
            return proxy.role;
        },
        sort: true,
        align: 'left',
    },
    version: {
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
        caption: 'B',
        align: 'center',
        tooltipProps: {placement: 'bottom', content: 'Banned'},
    },
    load_average: {
        get(proxy) {
            return proxy.loadAverage;
        },
        sort: true,
        align: 'right',
    },
    updated_at: {
        get(proxy) {
            return proxy.updatedAt;
        },
        sort: true,
        align: 'right',
    },
    network_load: {
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
