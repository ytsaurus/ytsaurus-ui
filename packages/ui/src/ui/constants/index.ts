import {ValueOf} from '../types/index';
import createActionTypes, {createPrefix} from './utils';
export {Page} from '../../shared/constants/settings';

export * from './system/nodes';

export const HEADER_HEIGHT = 56;
export const STICKY_VERTICAL_PADDING = 10;

export const KeyCode = {
    ESCAPE: 27,
    ENTER: 13,
    ARROW_UP: 38,
    ARROW_DOWN: 40,
    TAB: 9,
};

export const LOADING_STATUS = {
    UNINITIALIZED: '',
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error',
    CANCELLED: 'cancelled',
} as const;

export const PRELOAD_ERROR = {
    GENERAL: 'general',
    CONNECTION: 'connection',
    AUTHENTICATION: 'authentication',
} as const;

export type PreloadErrorType = ValueOf<typeof PRELOAD_ERROR>;

export const TYPED_OUTPUT_FORMAT = {
    $value: 'json' as const,
    $attributes: {
        stringify: true,
        annotate_with_types: true,
    },
};

// Menu
const MENU_PREFIX = createPrefix('MENU');

export const SPLIT_MENU_ITEMS = MENU_PREFIX + 'SPLIT_MENU_ITEMS';
export const JOIN_MENU_ITEMS = MENU_PREFIX + 'JOIN_MENU_ITEMS';

// Settings
const SETTINGS_PREFIX = createPrefix('SETTINGS');

export const SET_SETTING_VALUE = `${SETTINGS_PREFIX}SET_SETTING_VALUE` as const;
export const UNSET_SETTING_VALUE = `${SETTINGS_PREFIX}UNSET_SETTING_VALUE` as const;
export const UPDATE_SETTING_DATA = `${SETTINGS_PREFIX}UPDATE_SETTING_DATA` as const;

// Global
const GLOBAL_PREFIX = createPrefix('GLOBAL');

export const UPDATE_TITLE = GLOBAL_PREFIX + 'UPDATE_TITLE';
export const BLOCK_USER = GLOBAL_PREFIX + 'BLOCK_USER';
export const BAN_USER = GLOBAL_PREFIX + 'BAN_USER';
export const INC_NAV_BLOCKER_COUNTER = GLOBAL_PREFIX + 'INC_NAV_BLOCKER_COUNTER';
export const DEC_NAV_BLOCKER_COUNTER = GLOBAL_PREFIX + 'DEC_NAV_BLOCKER_COUNTER';
export const SET_MAINTENANCE_PAGE_EVENT = GLOBAL_PREFIX + 'SET_MAINTENANCE_PAGE_EVENT';
export const SPLIT_SCREEN = GLOBAL_PREFIX + 'SPLIT_SCREEN';
export const MERGE_SCREEN = GLOBAL_PREFIX + 'MERGE_SCREEN';
export const INIT_CLUSTER_PARAMS = createActionTypes(GLOBAL_PREFIX + 'INIT_CLUSTER_PARAMS');
export const UPDATE_CLUSTER = {
    ...createActionTypes(GLOBAL_PREFIX + 'UPDATE_CLUSTER'),
    FINAL_SUCCESS: `${GLOBAL_PREFIX}_UPDATE_CLUSTER_FINAL_SUCCESS`,
};
export const GLOBAL_SET_THEME = 'GLOBAL_SET_THEME';

export const MediumType = {
    DEFAULT: 'default',
    ALL: 'all',
};

// Cluster menu
const CLUSTER_MENU_PREFIX = createPrefix('CLUSTER_MENU');

export const FETCH_CLUSTER_VERSIONS = createActionTypes(
    `${CLUSTER_MENU_PREFIX}FETCH_CLUSTER_VERSIONS`,
);
export const FETCH_CLUSTER_AVAILABILITY = createActionTypes(
    `${CLUSTER_MENU_PREFIX}FETCH_CLUSTER_AVAILABILITY`,
);

export const FETCH_CLUSTER_AUTH_STATUS = createActionTypes('FETCH_CLUSTER_AUTH_STATUS');

export const CLUSTERS_MENU_UPDATE_VIEWMODE = `${CLUSTER_MENU_PREFIX}UPDATE_VIEWMODE` as const;
export const CLUSTERS_MENU_UPDATE_FILTER = `${CLUSTER_MENU_PREFIX}UPDATE_FILTER` as const;

export const SPLIT_PANE_ID = 'split-portal';

export const DASHBOARD_VIEW_CONTEXT = 'dashboard';

export const GENERIC_ERROR_MESSAGE = ' If the problem persists please report it via Bug Reporter.';
