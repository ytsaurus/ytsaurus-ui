import {DashKitProps} from '@gravity-ui/dashkit';

export const rowHeight = 12;

const navigationLayoutWidth = 13;
const accountsLayoutWidth = 18;
const queriesLayoutWidth = 18;

export const defaultDashboardItems = {
    navigation: {
        layout: {
            h: rowHeight,
            i: 'navigation',
            w: navigationLayoutWidth,
            x: 0,
            y: 0,
        },
        data: {name: 'Navigation'},
    },
    operations: {
        layout: {
            h: rowHeight,
            i: 'operations',
            w: 23,
            x: navigationLayoutWidth,
            y: 0,
        },
        data: {name: 'Operations'},
    },
    queries: {
        layout: {
            h: rowHeight,
            i: 'queries',
            w: queriesLayoutWidth,
            x: 0,
            y: rowHeight,
        },
        data: {name: 'Queries'},
    },
    services: {
        layout: {
            h: rowHeight,
            i: 'services',
            w: 18,
            x: 0,
            y: rowHeight * 2,
        },
        data: {name: 'Services'},
    },
    accounts: {
        layout: {
            h: rowHeight,
            i: 'accounts',
            w: accountsLayoutWidth,
            x: queriesLayoutWidth,
            y: rowHeight,
        },
        data: {name: 'Accounts'},
    },
    pools: {
        layout: {
            h: rowHeight,
            i: 'pools',
            w: 18,
            x: 18,
            y: rowHeight * 2,
        },
        data: {name: 'Pools', columns: ['memory', 'cpu', 'operations']},
    },
};

export const dashboardConfig: DashKitProps['config'] = {
    salt: '0.1231231023012831',
    counter: 6,
    items: [
        {
            id: 'navigation',
            data: defaultDashboardItems.navigation.data,
            type: 'navigation',
            namespace: 'dashboard',
            orderId: 0,
        },
        {
            id: 'operations',
            data: {name: 'Operations'},
            type: 'operations',
            namespace: 'dashboard',
            orderId: 1,
        },
        {
            id: 'queries',
            data: {name: 'Queries'},
            type: 'queries',
            namespace: 'dashboard',
            orderId: 2,
        },
        // {
        //     id: 'services',
        //     data: {name: 'Services'},
        //     type: 'services',
        //     namespace: 'dashboard',
        //     orderId: 3,
        // },
        {
            id: 'accounts',
            data: {name: 'Accounts'},
            type: 'accounts',
            namespace: 'dashboard',
            orderId: 4,
        },
        // {
        //     id: 'pools',
        //     data: {name: 'Pools', columns: ['memory', 'cpu', 'operations']},
        //     type: 'pools',
        //     namespace: 'dashboard',
        //     orderId: 5,
        // },
    ],
    layout: [
        defaultDashboardItems['navigation'].layout,
        defaultDashboardItems['operations'].layout,
        defaultDashboardItems['queries'].layout,
        // defaultDashboardItems['services'].layout,
        defaultDashboardItems['accounts'].layout,
        // defaultDashboardItems['pools'].layout,
    ],
    aliases: {},
    connections: [],
};
