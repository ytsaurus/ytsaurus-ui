import {YTCoreConfig} from '../../@types/core';
import {NAMESPACES, Page, SettingName} from '../../shared/constants/settings';
import {Settings} from '../../shared/constants/settings-types';
import {getPath} from '../../shared/utils/settings';

const defaultSettings = {
    GLOBAL: {
        [SettingName.GLOBAL.THEME]: 'system',
        [SettingName.GLOBAL.AUTO_REFRESH]: true,
        [SettingName.GLOBAL.PAGES_ORDER]: [],
        [SettingName.GLOBAL.PAGES_PINNED]: {
            [Page.NAVIGATION]: true,
            [Page.OPERATIONS]: true,
            [Page.DASHBOARD]: true,
            [Page.SYSTEM]: true,
        },
        [SettingName.GLOBAL.NAVIGATION_PANEL_EXPAND]: undefined as boolean | undefined,
    },
    YSON: {
        [SettingName.YSON.FORMAT]: 'json',
        [SettingName.YSON.COMPACT]: false,
        [SettingName.YSON.ESCAPE_WHITESPACES]: true,
        [SettingName.YSON.SHOW_DECODED]: true,
        [SettingName.YSON.BINARY_AS_HEX]: true,
    },
    DEVELOPMENT: {
        [SettingName.DEVELOPMENT.REDIRECT_TO_BETA]: false,
        [SettingName.DEVELOPMENT.REDIRECT_TO_BETA_SWITCHED]: false,
        [SettingName.DEVELOPMENT.YQL_TYPES]: true,
        [SettingName.DEVELOPMENT.REGULAR_USER_UI]: false,
    },
    SYSTEM: {
        [SettingName.SYSTEM.MASTERS_HOST_TYPE]: 'host',
        [SettingName.SYSTEM.MASTERS_COLLAPSED]: true,
        [SettingName.SYSTEM.SCHEDULERS_COLLAPSED]: true,
        [SettingName.SYSTEM.CHUNKS_COLLAPSED]: true,
        [SettingName.SYSTEM.HTTP_PROXIES_COLLAPSED]: true,
        [SettingName.SYSTEM.RPC_PROXIES_COLLAPSED]: true,
        [SettingName.SYSTEM.NODES_COLLAPSED]: false,
    },
    OPERATIONS: {
        [SettingName.OPERATIONS.STATISTICS_AGGREGATION_TYPE]: 'avg',
        [SettingName.OPERATIONS.STATISTICS_ACTIVE_JOB_TYPES]: {},
    },
    NAVIGATION: {
        [SettingName.NAVIGATION.USE_SMART_SORT]: true,
        [SettingName.NAVIGATION.GROUP_NODES]: true,
        [SettingName.NAVIGATION.ENABLE_PATH_AUTO_CORRECTION]: true,
        [SettingName.NAVIGATION.USE_SMART_FILTER]: false,
        [SettingName.NAVIGATION.ROWS_PER_TABLE_PAGE]: 100,
        [SettingName.NAVIGATION.MAXIMUM_TABLE_STRING_SIZE]: 1024,
        [SettingName.NAVIGATION.DEFAULT_TABLE_COLUMN_LIMIT]: 50,
        [SettingName.NAVIGATION.ENABLE_TABLE_SIMILARITY]: false,
        [SettingName.NAVIGATION.DEFAULT_CHYT_ALIAS]: ' *ch_public',
        [SettingName.NAVIGATION.ANNOTATION_VISIBILITY]: 'partial',
        [SettingName.NAVIGATION.QUEUE_PARTITIONS_VISIBILITY]: [], // YTFRONT-3327-column-button
        [SettingName.NAVIGATION.QUEUE_CONSUMERS_VISIBILITY]: [], // YTFRONT-3327-column-button
        [SettingName.NAVIGATION.CONSUMER_PARTITIONS_VISIBILITY]: [], // YTFRONT-3327-column-button
    },
    COMPONENTS: {
        [SettingName.COMPONENTS.ENABLE_SIDE_BAR]: false,
    },
    A11Y: {
        [SettingName.A11Y.USE_SAFE_COLORS]: false,
    },
    MENU: {
        [SettingName.MENU.STARTING_PAGE]: 'navigation',
        [SettingName.MENU.PRESERVE_STATE]: false,
        [SettingName.MENU.RECENT_CLUSTER_FIRST]: true,
        [SettingName.MENU.RECENT_PAGE_FIRST]: true,
    },
    ACCOUNTS: {
        [SettingName.ACCOUNTS.DASHBOARD_VISIBILITY_MODE]: 'usable',
        [SettingName.ACCOUNTS.ACCOUNTS_VISIBILITY_MODE]: 'all',
        [SettingName.ACCOUNTS.EXPAND_STATIC_CONFIGURATION]: true,
        [SettingName.ACCOUNTS.ACCOUNTS_USAGE_VIEW_TYPE]: 'tree',
        [SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_TREE]: [],
        [SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST]: [],
        [SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST_FOLDERS]: [],
    },
    SCHEDULING: {
        [SettingName.SCHEDULING.EXPAND_STATIC_CONFIGURATION]: false,
    },
};

const namespaces: Record<string, {value: string}> = NAMESPACES;

const defaultUserSettings: Settings = Object.entries(defaultSettings).reduce(
    (res, [ns, settings]) => {
        Object.entries(settings).forEach(([key, val]) => {
            res[getPath(key, namespaces[ns])] = val;
        });
        return res;
    },
    {} as Settings,
);

export function getDafaultUserSettings(config: YTCoreConfig) {
    Object.assign(defaultUserSettings, config.defaultUserSettingsOverrides);
    return defaultUserSettings;
}
