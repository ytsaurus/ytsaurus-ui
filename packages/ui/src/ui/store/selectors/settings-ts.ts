import {createSelector} from 'reselect';

import {getSettingSelectedFontType, makeGetSetting} from './settings';
import {NAMESPACES, SettingName} from '../../../shared/constants/settings';
import {AccountUsageViewType} from '../reducers/accounts/usage/accounts-usage-filters';
import {AccountUsageDataItem} from '../../store/reducers/accounts/usage/account-usage-types';
import {ActiveJobTypesMap} from '../../store/actions/settings/settings';
import {RootState} from '../../store/reducers';
import {uiSettings} from '../../config';
import _ from 'lodash';
import {NODE_TYPE} from '../../../shared/constants/system';

export const getSettingsDataRaw = (state: RootState) => state.settings.data;

export const getFontType = createSelector(
    getSettingSelectedFontType,
    (selectedFontType: string) => {
        const {defaultFontType} = uiSettings;
        if (selectedFontType === 'auto' && defaultFontType) {
            return defaultFontType;
        }
        return selectedFontType;
    },
);

export const getFontFamilies = createSelector(getFontType, (fontType) => {
    const {fontTypes} = uiSettings;
    if (fontTypes?.[fontType]) {
        const {regular, monospace} = fontTypes?.[fontType];
        if (regular && monospace) {
            return fontTypes[fontType];
        }
        throw new Error(
            `'uiSettings.fontTypes[${fontType}]' must contain non empty fields: regular, monospace`,
        );
    }
    return {regular: 'Manrope', monospace: 'RobotoMono'};
});

export const getSettingsPagesOrder = createSelector(makeGetSetting, (getSetting): Array<string> => {
    return getSetting(SettingName.GLOBAL.PAGES_ORDER, NAMESPACES.GLOBAL) || [];
});

export const getSettingsPagesPinned = createSelector(
    makeGetSetting,
    (getSetting): Record<string, boolean> => {
        return getSetting(SettingName.GLOBAL.PAGES_PINNED, NAMESPACES.GLOBAL) || {};
    },
);

export const getSettingsRegularUserUI = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.DEVELOPMENT.REGULAR_USER_UI, NAMESPACES.DEVELOPMENT) || false;
});

export const getSettingsSchedulingExpandStaticConfiguration = createSelector(
    makeGetSetting,
    (getSetting) => {
        return (
            getSetting(SettingName.SCHEDULING.EXPAND_STATIC_CONFIGURATION, NAMESPACES.SCHEDULING) ||
            false
        );
    },
);

export const getSettingsAccountsExpandStaticConfiguration = createSelector(
    makeGetSetting,
    (getSetting) => {
        return (
            getSetting(SettingName.ACCOUNTS.EXPAND_STATIC_CONFIGURATION, NAMESPACES.ACCOUNTS) ||
            false
        );
    },
);

export const getSettingsSystemMastersCollapsed = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.MASTERS_COLLAPSED, NAMESPACES.SYSTEM);
});

export const getSettingsSystemSchedulersCollapsed = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.SCHEDULERS_COLLAPSED, NAMESPACES.SYSTEM);
});

export const getSettingsSystemChunksCollapsed = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.CHUNKS_COLLAPSED, NAMESPACES.SYSTEM);
});

export const getSettingsSystemRpcProxiesCollapsed = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.RPC_PROXIES_COLLAPSED, NAMESPACES.SYSTEM);
});

export const getSettingsSystemHttpProxiesCollapsed = createSelector(
    makeGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.HTTP_PROXIES_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const getSettingsSystemNodesCollapsed = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.NODES_COLLAPSED, NAMESPACES.SYSTEM);
});

export const getSettingsAccountUsageViewType = createSelector(
    makeGetSetting,
    (getSetting): AccountUsageViewType => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_VIEW_TYPE, NAMESPACES.ACCOUNTS);
    },
);

export const getSettingsAccountUsageColumnsTree = createSelector(
    makeGetSetting,
    (getSetting): Array<keyof AccountUsageDataItem> => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_TREE, NAMESPACES.ACCOUNTS);
    },
);

export const getSettingsAccountUsageColumnsList = createSelector(
    makeGetSetting,
    (getSetting): Array<keyof AccountUsageDataItem> => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST, NAMESPACES.ACCOUNTS);
    },
);

export const getSettingsAccountUsageColumnsListFolders = createSelector(
    makeGetSetting,
    (getSetting): Array<keyof AccountUsageDataItem> => {
        return getSetting(
            SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST_FOLDERS,
            NAMESPACES.ACCOUNTS,
        );
    },
);

export const getSettingOperationStatisticsActiveJobTypes = createSelector(
    makeGetSetting,
    (getSetting): ActiveJobTypesMap => {
        return (
            getSetting(SettingName.OPERATIONS.STATISTICS_ACTIVE_JOB_TYPES, NAMESPACES.OPERATION) ??
            {}
        );
    },
);

export const getSettingsEnableSideBar = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.COMPONENTS.ENABLE_SIDE_BAR, NAMESPACES.COMPONENTS) ?? true;
});

// YTFRONT-3327-column-button
export const getSettingsNavigationQueuePartitionsVisibility = createSelector(
    makeGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.QUEUE_PARTITIONS_VISIBILITY, NAMESPACES.NAVIGATION),
);

// YTFRONT-3327-column-button
export const getSettingsNavigationQueueConsumersVisibility = createSelector(
    makeGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.QUEUE_CONSUMERS_VISIBILITY, NAMESPACES.NAVIGATION),
);

// YTFRONT-3327-column-button
export const getSettingsNavigationConsumerPartitionsVisibility = createSelector(
    makeGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.CONSUMER_PARTITIONS_VISIBILITY, NAMESPACES.NAVIGATION),
);

export const getSettingSystemNodesNodeType = createSelector(
    makeGetSetting,
    (getSetting): string => {
        return (
            getSetting(SettingName.SYSTEM.NODES_NODE_TYPE, NAMESPACES.SYSTEM) ?? NODE_TYPE.ALL_NODES
        );
    },
);
