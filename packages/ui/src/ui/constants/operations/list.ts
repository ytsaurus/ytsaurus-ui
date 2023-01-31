export const TEXT_FILTER = 'text';
export const STATE_FILTER = 'state';
export const PARAM_FILTER = 'param';

export const UPDATE_FILTER = 'OPERATIONS_LIST_UPDATE_FILTER';
export const UPDATE_FILTER_COUNTERS = 'OPERATIONS_LIST_UPDATE_FILTER_COUNTERS';

export const OPERATIONS_DATA_MODE = {
    CURRENT: 'current',
    ARCHIVE: 'archive',
} as const;
export const OPERATIONS_CURSOR_DIRECTION = {
    PAST: 'past',
    FUTURE: 'future',
} as const;
export const RESET_TIME_RANGE = 'OPERATIONS_LIST_RESET_TIME_RANGE';
export const SET_OPERATIONS_DATA_MODE = 'OPERATIONS_LIST_SET_OPERATIONS_DATA_MODE';

export const OPERATIONS_PAGE = {
    FIRST: 'first',
    LAST: 'last',
    NEXT: 'next',
    PREV: 'prev',
} as const;
export const UPDATE_CURSOR = 'OPERATIONS_LIST_UPDATE_CURSOR';

export const DEFAULT_PRESET_SETTING = 'defaultPreset';

export const OPERATIONS_LIST_RUNNING_PRESET = 'running';

export const APPLY_FILTER_PRESET = 'OPERATIONS_LIST_APPLY_FILTER_PRESET';
export const TOGGLE_SAVE_FILTER_PRESET_DIALOG = 'OPERATIONS_LIST_TOGGLE_SAVE_FILTER_PRESET_DIALOG';
export const UPDATE_SAVE_FILTER_PRESET_DIALOG = 'OPERATIONS_LIST_UPDATE_SAVE_FILTER_PRESET_DIALOG';

export const UPDATE_OPERATIONS_REQUEST = 'OPERATIONS_LIST_UPDATE_OPERATIONS_REQUEST';
export const UPDATE_OPERATIONS_SUCCESS = 'OPERATIONS_LIST_UPDATE_OPERATIONS_SUCCESS';
export const UPDATE_OPERATIONS_CANCELLED = 'OPERATIONS_LIST_UPDATE_OPERATIONS_CANCELLED';
export const UPDATE_OPERATIONS_FAILURE = 'OPERATIONS_LIST_UPDATE_OPERATIONS_FAILURE';

export const POLLING_INTERVAL = 30 * 1000;

export const OPERATIONS_LIST_DEFAULT_FILTERS = {
    text: '',
    user: 'all',
    subject: 'all',
    permissions: [] as Array<string>,
    poolTree: 'all',
    pool: 'all',
    type: 'all',
    state: 'all',
    failedJobs: false,
} as const;
