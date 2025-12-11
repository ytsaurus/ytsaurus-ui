import sortBy_ from 'lodash/sortBy';

import {createSelector} from 'reselect';

import {createNestedNS, getPath} from '../../../../shared/utils/settings';
import {FAVOURITES, NAMESPACES, SettingName} from '../../../../shared/constants/settings';

import {DEFAULT_PATH} from '../../../constants/navigation';

function _getSetting(settings) {
    return (name, parentNS) => settings.data[getPath(name, parentNS)];
}

const _settings = (state) => state.settings;

export const makeGetSetting = createSelector(_settings, _getSetting);

const getCluster = (state) => state.global.cluster;

export const getClusterNS = createSelector(getCluster, (cluster) =>
    createNestedNS(cluster, NAMESPACES.LOCAL),
);

export const getSchedulingNS = createSelector(getClusterNS, (clusterNS) =>
    createNestedNS('scheduling', clusterNS),
);

export const getAccountsNS = createSelector(getClusterNS, (clusterNS) =>
    createNestedNS('accounts', clusterNS),
);

export const getBundlesNS = createSelector(getClusterNS, (clusterNS) =>
    createNestedNS('bundles', clusterNS),
);

export const getChaosBundlesNS = createSelector(getClusterNS, (clusterNS) =>
    createNestedNS('chaosBundles', clusterNS),
);

export const getChytNS = createSelector(getClusterNS, (clusterNS) => {
    return createNestedNS('chyt', clusterNS);
});

export const getSettingTheme = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.GLOBAL.THEME, NAMESPACES.GLOBAL),
);

export const getLastVisitedTabs = createSelector(
    [makeGetSetting, getClusterNS],
    (getSetting, clusterNS) => getSetting(SettingName.LOCAL.LAST_VISITED_TAB, clusterNS) || {},
);

// [{ path: <path>, count: <count> }]
export const getLastVisited = createSelector(
    [makeGetSetting, getClusterNS],
    (getSetting, clusterNS) => getSetting(SettingName.LOCAL.LAST_VISITED, clusterNS) || [],
);

export const getPopular = createSelector(
    getLastVisited,
    // negate count to sort in descending order and make most visited entries come first
    (lastVisited) => sortBy_(lastVisited, (entry) => -entry.count),
);

export const getFavourites = createSelector(
    [makeGetSetting, getClusterNS],
    (getSetting, clusterNS) => getSetting(FAVOURITES, clusterNS) || [],
);

export const getNavigationDefaultPath = createSelector(
    [makeGetSetting, getClusterNS],
    (getSetting, clusterNS) =>
        getSetting(SettingName.LOCAL.NAVIGATION_DEFAULT_PATH, clusterNS) || DEFAULT_PATH,
);

export const isPathAutoCorrectionSettingEnabled = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.ENABLE_PATH_AUTO_CORRECTION, NAMESPACES.NAVIGATION),
);

export const isRecentClustersFirst = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.MENU.RECENT_CLUSTER_FIRST, NAMESPACES.MENU),
);

export const isRecentPagesFirst = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.MENU.RECENT_PAGE_FIRST, NAMESPACES.MENU),
);

export const shouldUseSafeColors = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.A11Y.USE_SAFE_COLORS, NAMESPACES.A11Y),
);

export const getStartingPage = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.MENU.STARTING_PAGE, NAMESPACES.MENU),
);

export const shouldUsePreserveState = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.MENU.PRESERVE_STATE, NAMESPACES.MENU),
);

export const getTemplates = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.COMPONENTS.TEMPLATES, NAMESPACES.COMPONENTS),
);

/** @type {(state: import('../reducers').RootState) => string[]} */
export const getSelectedColumns = createSelector(makeGetSetting, (getSetting) => {
    const selectedColumns = getSetting(
        SettingName.COMPONENTS.SELECTED_COLUMNS,
        NAMESPACES.COMPONENTS,
    );

    if (Array.isArray(selectedColumns) && !selectedColumns.includes('actions')) {
        return [...selectedColumns, 'actions'];
    }
    return selectedColumns;
});

export const getFormat = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.YSON.FORMAT, NAMESPACES.YSON),
);

export const shouldCompact = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.YSON.COMPACT, NAMESPACES.YSON),
);

export const shouldShowDecoded = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.YSON.SHOW_DECODED, NAMESPACES.YSON),
);

export const shouldEscapeWhitespace = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.YSON.ESCAPE_WHITESPACES, NAMESPACES.YSON),
);

export const useBinaryAsHex = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.YSON.BINARY_AS_HEX, NAMESPACES.YSON),
);

export const getShowDecoded = createSelector([makeGetSetting], (getSetting) =>
    getSetting(SettingName.YSON.SHOW_DECODED, NAMESPACES.YSON),
);

export const getRowsPerTablePage = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.ROWS_PER_TABLE_PAGE, NAMESPACES.NAVIGATION),
);

export const getMaximumTableStringSize = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.MAXIMUM_TABLE_STRING_SIZE, NAMESPACES.NAVIGATION),
);

export const getDefaultTableColumnLimit = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.DEFAULT_TABLE_COLUMN_LIMIT, NAMESPACES.NAVIGATION),
);

export const isTableSimilarityEnabled = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.ENABLE_TABLE_SIMILARITY, NAMESPACES.NAVIGATION),
);

export const getClusterPagePaneSizes = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.CLUSTER_PAGE_PANE_SIZES, NAMESPACES.NAVIGATION),
);

export const shouldGroupNodes = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.GROUP_NODES, NAMESPACES.NAVIGATION),
);

export const shouldUseSmartFilter = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.USE_SMART_FILTER, NAMESPACES.NAVIGATION),
);

export const shouldUseSmartSort = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.USE_SMART_SORT, NAMESPACES.NAVIGATION),
);

export const getDefaultChytAlias = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.NAVIGATION.DEFAULT_CHYT_ALIAS, NAMESPACES.NAVIGATION),
);

export const getMastersHostType = createSelector(makeGetSetting, (getSetting) =>
    getSetting(SettingName.SYSTEM.MASTERS_HOST_TYPE, NAMESPACES.SYSTEM),
);

export const getAccountsVisibilityModeOfDashboard = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.ACCOUNTS.DASHBOARD_VISIBILITY_MODE, NAMESPACES.ACCOUNTS);
});

export const getAccountsVisibilityMode = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.ACCOUNTS.ACCOUNTS_VISIBILITY_MODE, NAMESPACES.ACCOUNTS);
});

export const getSettingTableDisplayRawStrings = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.NAVIGATION.TABLE_DISPLAY_RAW_STRINGS, NAMESPACES.NAVIGATION);
});

export const getSettingAnnotationVisibility = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.NAVIGATION.ANNOTATION_VISIBILITY, NAMESPACES.NAVIGATION);
});

export const getSettingNavigationPanelExpanded = createSelector(makeGetSetting, (getSetting) => {
    const res = getSetting(SettingName.GLOBAL.NAVIGATION_PANEL_EXPAND, NAMESPACES.GLOBAL);
    if (res !== undefined) {
        return res;
    }

    try {
        const data = localStorage['nvAsideHeader'];
        if (!data) {
            return false;
        }
        const {isCompact} = JSON.parse(data) || {};
        return !isCompact;
    } catch {
        return false;
    }
});
