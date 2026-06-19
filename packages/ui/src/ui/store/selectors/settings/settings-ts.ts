import {createSelector} from 'reselect';

import {selectCluster} from '../../../store/selectors/global';
import {selectSettingsData} from './settings-base';
import {selectClusterNS, selectGetSetting} from '../../../store/selectors/settings';
import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';
import {type AccountUsageViewType} from '../../../store/reducers/accounts/usage/accounts-usage-filters';
import {type AccountUsageField} from '../../../store/reducers/accounts/usage/account-usage-types';
import {type ActiveJobTypesMap} from '../../../store/actions/settings/settings';
import {type RootState} from '../../../store/reducers';
import {NODE_TYPE} from '../../../../shared/constants/system';
import {type ValueOf} from '../../../types';

export const selectSettingsDataRaw = (state: RootState) => state.settings.data;

export const selectSettingsPagesOrder = createSelector(
    selectGetSetting,
    (getSetting): Array<string> => {
        return getSetting(SettingName.GLOBAL.PAGES_ORDER, NAMESPACES.GLOBAL) || [];
    },
);

export const selectSettingsPagesPinned = createSelector(
    selectGetSetting,
    (getSetting): Record<string, boolean> => {
        return getSetting(SettingName.GLOBAL.PAGES_PINNED, NAMESPACES.GLOBAL) || {};
    },
);

export const selectSettingsQueryTrackerNewGraphType = createSelector(selectSettingsData, (data) => {
    return data['global::queryTracker::useNewGraphView'] || false;
});

export const selectSettingsQueryTrackerGraphAutoCenter = createSelector(
    selectSettingsData,
    (data) => {
        return data['global::queryTracker::graphAutoCenter'] || false;
    },
);

export const selectSettingsEditorVimMode = createSelector(selectSettingsData, (data) => {
    return data['global::editor::vimMode'] || false;
});

export const selectSettingsSchedulingExpandStaticConfiguration = createSelector(
    selectGetSetting,
    (getSetting) => {
        return (
            getSetting(SettingName.SCHEDULING.EXPAND_STATIC_CONFIGURATION, NAMESPACES.SCHEDULING) ||
            false
        );
    },
);

export const selectSettingsAccountsExpandStaticConfiguration = createSelector(
    selectGetSetting,
    (getSetting) => {
        return (
            getSetting(SettingName.ACCOUNTS.EXPAND_STATIC_CONFIGURATION, NAMESPACES.ACCOUNTS) ||
            false
        );
    },
);

export const selectSettingsSystemMastersCollapsed = createSelector(
    selectGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.MASTERS_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const selectSettingsSystemSchedulersCollapsed = createSelector(
    selectGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.SCHEDULERS_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const selectSettingsSystemChunksCollapsed = createSelector(
    selectGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.CHUNKS_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const selectSettingsSystemRpcProxiesCollapsed = createSelector(
    selectGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.RPC_PROXIES_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const selectSettingsSystemCypressProxiesCollapsed = createSelector(
    selectSettingsData,
    (data) => {
        return data['global::system::cypressProxiesCollapsed'] ?? true;
    },
);
export const selectSettingsSystemHttpProxiesCollapsed = createSelector(
    selectGetSetting,
    (getSetting) => {
        return getSetting(SettingName.SYSTEM.HTTP_PROXIES_COLLAPSED, NAMESPACES.SYSTEM);
    },
);

export const selectSettingsSystemNodesCollapsed = createSelector(selectGetSetting, (getSetting) => {
    return getSetting(SettingName.SYSTEM.NODES_COLLAPSED, NAMESPACES.SYSTEM);
});

export const selectSettingsAccountUsageViewType = createSelector(
    selectGetSetting,
    (getSetting): AccountUsageViewType => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_VIEW_TYPE, NAMESPACES.ACCOUNTS);
    },
);

export const selectSettingsAccountUsageColumnsTree = createSelector(
    selectGetSetting,
    (getSetting): AccountUsageField[] => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_TREE, NAMESPACES.ACCOUNTS);
    },
);

export const selectSettingsAccountUsageColumnsList = createSelector(
    selectGetSetting,
    (getSetting): AccountUsageField[] => {
        return getSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST, NAMESPACES.ACCOUNTS);
    },
);

export const selectSettingsAccountUsageColumnsListFolders = createSelector(
    selectGetSetting,
    (getSetting): AccountUsageField[] => {
        return getSetting(
            SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST_FOLDERS,
            NAMESPACES.ACCOUNTS,
        );
    },
);

export const selectSettingOperationStatisticsActiveJobTypes = createSelector(
    selectGetSetting,
    (getSetting): ActiveJobTypesMap => {
        return (
            getSetting(SettingName.OPERATIONS.STATISTICS_ACTIVE_JOB_TYPES, NAMESPACES.OPERATION) ??
            {}
        );
    },
);

export const selectSettingsEnableSideBar = createSelector(selectGetSetting, (getSetting) => {
    return getSetting(SettingName.COMPONENTS.ENABLE_SIDE_BAR, NAMESPACES.COMPONENTS) ?? true;
});

// YTFRONT-3327-column-button
export const selectSettingsNavigationQueuePartitionsVisibility = createSelector(
    selectGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.QUEUE_PARTITIONS_VISIBILITY, NAMESPACES.NAVIGATION),
);

// YTFRONT-3327-column-button
export const selectSettingsNavigationQueueConsumersVisibility = createSelector(
    selectGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.QUEUE_CONSUMERS_VISIBILITY, NAMESPACES.NAVIGATION),
);

// YTFRONT-3327-column-button
export const selectSettingsNavigationConsumerPartitionsVisibility = createSelector(
    selectGetSetting,
    (getSetting): Array<string> =>
        getSetting(SettingName.NAVIGATION.CONSUMER_PARTITIONS_VISIBILITY, NAMESPACES.NAVIGATION),
);

export const selectSettingSystemNodesNodeType = createSelector(
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

export const selectSettingQueryTrackerStage = createSelector(
    selectGetSetting,
    (getSetting): string | undefined => {
        const res = getSetting(SettingName.QUERY_TRACKER.STAGE, NAMESPACES.QUERY_TRACKER);
        return res !== '' ? res : undefined;
    },
);

export const selectSettingQueryTrackerYQLAgentStage = createSelector(
    selectGetSetting,
    (getSetting): string | undefined => {
        const res = getSetting(SettingName.QUERY_TRACKER.YQL_AGENT_STAGE, NAMESPACES.QUERY_TRACKER);
        return res !== '' ? res : undefined;
    },
);

export const selectCurrentClusterNS = createSelector(
    [selectCluster, selectClusterNS],
    (cluster, ns) => {
        return cluster ? ns : undefined;
    },
);
export const selectUseAutoRefresh = (state: RootState) =>
    selectSettingsData(state)['global::autoRefresh'];
