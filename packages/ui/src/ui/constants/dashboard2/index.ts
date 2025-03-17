import {DashKitProps} from '@gravity-ui/dashkit';

export const rowHeight = 18;

const navigationLayoutWidth = 13;
const accountsLayoutWidth = 18;

export const Layouts = {
    navigation: {
        h: rowHeight,
        i: 'navigation',
        w: navigationLayoutWidth,
        x: 0,
        y: 0,
    },
    operations: {
        h: rowHeight,
        i: 'operations',
        w: 23,
        x: navigationLayoutWidth,
        y: 0,
    },
    accounts: {
        h: rowHeight,
        i: 'accounts',
        w: accountsLayoutWidth,
        x: 0,
        y: rowHeight,
    },
    pools: {
        h: rowHeight,
        i: 'pools',
        w: 18,
        x: accountsLayoutWidth,
        y: rowHeight,
    },
    queries: {
        h: rowHeight,
        i: 'queries',
        w: 18,
        x: 0,
        y: rowHeight * 2,
    },
};

export const dashboardConfig: DashKitProps['config'] = {
    salt: '0.1231231023012831',
    counter: 5,
    items: [
        {
            id: 'navigation',
            data: {
                name: 'Navigation',
                asd: '',
            },
            type: 'navigation',
            namespace: 'dashboard',
            orderId: 0,
        },
        {
            id: 'operations',
            data: {},
            type: 'operations',
            namespace: 'dashboard',
            orderId: 1,
        },
        {
            id: 'accounts',
            data: {},
            type: 'accounts',
            namespace: 'dashboard',
            orderId: 2,
        },
        {
            id: 'pools',
            data: {},
            type: 'pools',
            namespace: 'dashboard',
            orderId: 2,
        },
        {
            id: 'queries',
            data: {},
            type: 'queries',
            namespace: 'dashboard',
            orderId: 4,
        },
    ],
    layout: [
        Layouts['navigation'],
        Layouts['operations'],
        Layouts['pools'],
        Layouts['accounts'],
        Layouts['queries'],
    ],
    aliases: {},
    connections: [],
};
