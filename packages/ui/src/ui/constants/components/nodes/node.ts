import createActionTypes from '../../../constants/utils';

export const NODE_LOAD_REQUEST = 'NODE_LOAD_REQUEST';
export const NODE_LOAD_SUCCESS = 'NODE_LOAD_SUCCESS';
export const NODE_LOAD_FAILURE = 'NODE_LOAD_FAILURE';

export const NODE_UNRECOGNIEZED_OPTIONS = createActionTypes('NODE_UNRECOGNIEZED_OPTIONS');

export const NodeTab = {
    GENERAL: 'general',
    MEMORY_USAGE: 'memory',
    LOCATIONS: 'locations',
    TABLET_SLOTS: 'tablet_slots',
    ALERTS: 'alerts',
    UNRECOGNIZED_OPTIONS: 'unrecognized_options',
} as const;
