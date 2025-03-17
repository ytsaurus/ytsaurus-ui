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
