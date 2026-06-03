import {createSelector} from 'reselect';

import {selectCluster} from '../../../store/selectors/global';
import {selectSettingsData} from './settings-base';
import {selectClusterNS, selectGetSetting} from '../../../store/selectors/settings';
import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';
import {type AccountUsageViewType} from '../../../store/reducers/accounts/usage/accounts-usage-filters';
import {type AccountUsageDataItem} from '../../../store/reducers/accounts/usage/account-usage-types';
import {type ActiveJobTypesMap} from '../../../store/actions/settings/settings';
import {type RootState} from '../../../store/reducers';
import {NODE_TYPE} from '../../../../shared/constants/system';
import {type ValueOf} from '../../../types';

export const getSettingsDataRaw = (state: RootState) => state.settings.data;

export const getSettingsPagesOrder = createSelector(
    selectGetSetting,
    (getSetting): Array<string> => {
        return getSetting(SettingName.GLOBAL.PAGES_ORDER, NAMESPACES.GLOBAL) || [];
    },
);

export const getSettingsPagesPinned = createSelector(
    selectGetSetting,
    (getSetting): Record<string, boolean> => {
        return getSetting(SettingName.GLOBAL.PAGES_PINNED, NAMESPACES.GLOBAL) || {};
    },
);

export const getSettingsQueryTrackerNewGraphType = createSelector(selectSettingsData, (data) => {
    return data['global::queryTracker::useNewGraphView'] || false;
});

export const getSettingsQueryTrackerGraphAutoCenter = createSelector(selectSettingsData, (data) => {
    return data['global::queryTracker::graphAutoCenter'] || false;
});

export const getSettingsEditorVimMode = createSelector(selectSettingsData, (data) => {
    return data['global::editor::vimMode'] || false;
});

export const getSettingsSchedulingExpandStaticConfiguration = createSelector(
    selectGetSetting,
    (getSetting) => {
        return (
            getSetting(SettingName.SCHEDULING.EXPAND_STATIC_CONFIGURATION, NAMESPACES.SCHEDULING) ||
            false
        );
    },
);

export const getSettingsAccountsExpandStaticConfiguration = createSelector(
    selectGetSetting,
    (getSetting) => {
        return (
            getSetting(SettingName.ACCOUNTS.EXPAND_STATIC_CONFIGURATION, NAMESPACES.ACCOUNTS) ||
            false
        );
    },
);

export const getSettingsSystemMastersCollapsed = createSelector(selectGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.MASTERS_COLLAPSED, NAMESPACES.SYSTEM);
});

export const getSettingsSystemSchedulersCollapsed = createSelector(
    selectGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.SCHEDULERS_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const getSettingsSystemChunksCollapsed = createSelector(selectGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.CHUNKS_COLLAPSED, NAMESPACES.SYSTEM);
});

export const getSettingsSystemRpcProxiesCollapsed = createSelector(
    selectGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.RPC_PROXIES_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const getSettingsSystemCypressProxiesCollapsed = createSelector(
    selectSettingsData,
    (data) => {
        return data['global::system::cypressProxiesCollapsed'] ?? true;
    },
);
export const getSettingsSystemHttpProxiesCollapsed = createSelector(
    selectGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.HTTP_PROXIES_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const getSettingsSystemNodesCollapsed = createSelector(selectGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.NODES_COLLAPSED, NAMESPACES.SYSTEM);
});

export const getSettingsAccountUsageViewType = createSelector(
    selectGetSetting,
    (getSetting): AccountUsageViewType => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_VIEW_TYPE, NAMESPACES.ACCOUNTS);
    },
);

export const getSettingsAccountUsageColumnsTree = createSelector(
    selectGetSetting,
    (getSetting): Array<keyof AccountUsageDataItem> => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_TREE, NAMESPACES.ACCOUNTS);
    },
);

export const getSettingsAccountUsageColumnsList = createSelector(
    selectGetSetting,
    (getSetting): Array<keyof AccountUsageDataItem> => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST, NAMESPACES.ACCOUNTS);
    },
);

export const getSettingsAccountUsageColumnsListFolders = createSelector(
    selectGetSetting,
    (getSetting): Array<keyof AccountUsageDataItem> => {
        return getSetting(
            SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST_FOLDERS,
            NAMESPACES.ACCOUNTS,
        );
    },
);

export const getSettingOperationStatisticsActiveJobTypes = createSelector(
    selectGetSetting,
    (getSetting): ActiveJobTypesMap => {
        return (
            getSetting(SettingName.OPERATIONS.STATISTICS_ACTIVE_JOB_TYPES, NAMESPACES.OPERATION) ??
            {}
        );
    },
);

export const getSettingsEnableSideBar = createSelector(selectGetSetting, (getSetting) => {
    return getSetting(SettingName.COMPONENTS.ENABLE_SIDE_BAR, NAMESPACES.COMPONENTS) ?? true;
});

// YTFRONT-3327-column-button
export const getSettingsNavigationQueuePartitionsVisibility = createSelector(
    selectGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.QUEUE_PARTITIONS_VISIBILITY, NAMESPACES.NAVIGATION),
);

// YTFRONT-3327-column-button
export const getSettingsNavigationQueueConsumersVisibility = createSelector(
    selectGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.QUEUE_CONSUMERS_VISIBILITY, NAMESPACES.NAVIGATION),
);

// YTFRONT-3327-column-button
export const getSettingsNavigationConsumerPartitionsVisibility = createSelector(
    selectGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.CONSUMER_PARTITIONS_VISIBILITY, NAMESPACES.NAVIGATION),
);

export const getSettingSystemNodesNodeType = createSelector(
    selectGetSetting,
    (getSetting): Array<ValueOf<typeof NODE_TYPE>> => {
        const propValue = getSetting(SettingName.SYSTEM.NODES_NODE_TYPE, NAMESPACES.SYSTEM) ?? '';
        const items = typeof propValue === 'string' ? propValue.split(',') : [];
        const allowedValues = Object.values(NODE_TYPE);
        const allowedSet = new Set(allowedValues);

        const res: typeof allowedValues = [];
        items.forEach((v) => {
            if (allowedSet.has(v as any)) {
                res.push(v as (typeof allowedValues)[number]);
            }
        });

        if (!res.length) {
            res.push(NODE_TYPE.ALL_NODES);
        }

        return res;
    },
);

export const getSettingQueryTrackerStage = createSelector(
    selectGetSetting,
    (getSetting): string | undefined => {
        const res = getSetting(SettingName.QUERY_TRACKER.STAGE, NAMESPACES.QUERY_TRACKER);
        return res !== '' ? res : undefined;
    },
);

export const getSettingQueryTrackerYQLAgentStage = createSelector(
    selectGetSetting,
    (getSetting): string | undefined => {
        const res = getSetting(SettingName.QUERY_TRACKER.YQL_AGENT_STAGE, NAMESPACES.QUERY_TRACKER);
        return res !== '' ? res : undefined;
    },
);

export const getCurrentClusterNS = createSelector(
    [selectCluster, selectClusterNS],
    (cluster, ns) => {
        return cluster ? ns : undefined;
    },
);
export const getUseAutoRefresh = (state: RootState) =>
    selectSettingsData(state)['global::autoRefresh'];
