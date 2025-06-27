import {DashKitProps} from '@gravity-ui/dashkit';

const navigationLayoutWidth = 16;
const accountsLayoutWidth = 20;
const queriesLayoutWidth = 18;
const servicesLayoutWidth = 18;

export const defaultDashboardItems = {
    navigation: {
        layout: {
            h: 21,
            i: 'navigation',
            w: navigationLayoutWidth,
            x: 0,
            y: 0,
        },
        data: {name: 'Navigation'},
    },
    operations: {
        layout: {
            h: 16,
            i: 'operations',
            w: 36,
            x: 0,
            y: 21,
        },
        data: {name: 'Operations', limit: {value: 5}},
    },
    queries: {
        layout: {
            h: 9.5,
            i: 'queries',
            w: queriesLayoutWidth,
            x: 0,
            y: 0,
        },
        data: {name: 'Queries', limit: {value: 3}},
    },
    services: {
        layout: {
            h: 9.5,
            i: 'services',
            w: servicesLayoutWidth,
            x: 0,
            y: 0,
        },
        data: {name: 'Services'},
    },
    accounts: {
        layout: {
            h: 10.5,
            i: 'accounts',
            w: accountsLayoutWidth,
            x: navigationLayoutWidth,
            y: 0,
        },
        data: {name: 'Accounts', columns: [{name: 'Nodes'}, {name: 'Chunks'}]},
    },
    pools: {
        layout: {
            h: 10.5,
            i: 'pools',
            w: accountsLayoutWidth,
            x: navigationLayoutWidth,
            y: 10.5,
        },
        data: {name: 'Pools', columns: ['memory', 'cpu', 'operations']},
    },
};

export const dashboardConfig: DashKitProps['config'] = {
    salt: '0.1231231023012831',
    counter: 4,
    items: [
        {
            id: 'navigation',
            data: defaultDashboardItems.navigation.data,
            type: 'navigation',
            namespace: 'dashboard',
            orderId: 0,
        },
        {
            id: 'accounts',
            data: defaultDashboardItems.accounts.data,
            type: 'accounts',
            namespace: 'dashboard',
            orderId: 1,
        },
        {
            id: 'pools',
            data: defaultDashboardItems.pools.data,
            type: 'pools',
            namespace: 'dashboard',
            orderId: 2,
        },
        {
            id: 'operations',
            data: defaultDashboardItems.operations.data,
            type: 'operations',
            namespace: 'dashboard',
            orderId: 3,
        },
    ],
    layout: [
        defaultDashboardItems['navigation'].layout,
        defaultDashboardItems['accounts'].layout,
        defaultDashboardItems['pools'].layout,
        defaultDashboardItems['operations'].layout,
    ],
    aliases: {},
    connections: [],
};
