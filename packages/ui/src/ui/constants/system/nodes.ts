import createActionTypes from '../../constants/utils';

// Node and Racks
export const flagToChar = {
    alerts: 'A',
    decommissioned: 'D',
    full: 'F',
} as const;

export const Node = {
    COUNT_IN_ROW: 6,
    SIZE: 10,
    OFFSET: 2,
    SIDE: 10 + 2 * 2,
} as const;

export const Flag = {
    OFFSET_X: 1.5,
    OFFSET_Y: 1,
} as const;

export const SYSTEM_NODES_FILTERS_PARTIAL = 'SYSTEM_NODES_FILTERS_PARTIAL';

export const UNAWARE = 'unaware';

export const FETCH_PROXIES = createActionTypes('PROXIES');

export const FETCH_RPC_PROXIES = createActionTypes('RPC_PROXIES');
