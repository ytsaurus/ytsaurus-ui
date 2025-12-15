import {createNS, createNestedNS} from '../utils/settings';

// @depricated Please use `settings-types.ts` to add new options
export const Page = {
    BAN: 'ban',
    JOB: 'job',
    MAINTENANCE: 'maintenance',
    COMPONENTS: 'components',
    SYSTEM: 'system',
    NAVIGATION: 'navigation',
    FLOWS: 'flows',
    ACCOUNTS: 'accounts',
    OPERATIONS: 'operations',
    DASHBOARD: 'dashboard',
    PATH_VIEWER: 'path-viewer',
    TABLET: 'tablet',
    USERS: 'users',
    GROUPS: 'groups',
    SCHEDULING: 'scheduling',
    TABLET_CELL_BUNDLES: 'tablet_cell_bundles',
    CHAOS_CELL_BUNDLES: 'chaos_cell_bundles',
    VERSIONS: 'versions',
    QUERIES: 'queries',
    CHYT: 'chyt',
} as const;

// @depricated Please use `settings-types.ts` to add new options
export const SettingName = {
    LOCAL: {
        FAVOURITES: 'favourites',
        LAST_VISITED: 'lastVisited',
        LAST_VISITED_TAB: 'lastVisitedTab',
        LAST_VISITED_PAGE: 'pageLastVisited',
        LAST_VISITED_CLUSTER: 'clusterLastVisited',
        NAVIGATION_DEFAULT_PATH: 'navigationDefaultPath',
    },
    GLOBAL: {
        THEME: 'theme',
        FONT_TYPE: 'fontType',
        NAVIGATION_PANEL_EXPAND: 'navigationPanelExpand',
        AUTO_REFRESH: 'autoRefresh',
        PAGES_ORDER: 'pagesOrder',
        PAGES_PINNED: 'pagesPinned',
    },
    YSON: {
        FORMAT: 'format',
        COMPACT: 'compact',
        ESCAPE_WHITESPACES: 'escapeWhitespace',
        SHOW_DECODED: 'showDecoded',
        BINARY_AS_HEX: 'binaryAsHex',
    },
    DEVELOPMENT: {
        REDIRECT_TO_BETA: 'redirectToBeta',
        REDIRECT_TO_BETA_SWITCHED: 'redirectToBetaSwitched',
        YQL_TYPES: 'yqlTypes',
        REGULAR_USER_UI: 'regularUserUI',
    },
    MENU: {
        STARTING_PAGE: 'startingPage',
        PRESERVE_STATE: 'preserveState',
        RECENT_CLUSTER_FIRST: 'recentClustersFirst',
        RECENT_PAGE_FIRST: 'recentPagesFirst',
    },
    COMPONENTS: {
        ENABLE_SIDE_BAR: 'enableSideBar',
        SELECTED_COLUMNS: 'selectedColumns',
        TEMPLATES: 'templates',
    },
    SYSTEM: {
        MASTERS_HOST_TYPE: 'mastersHostType',
        MASTERS_COLLAPSED: 'mastersCollapsed',
        SCHEDULERS_COLLAPSED: 'schedulersCollapsed',
        CHUNKS_COLLAPSED: 'chunksCollapsed',
        HTTP_PROXIES_COLLAPSED: 'httpProxiesCollapsed',
        RPC_PROXIES_COLLAPSED: 'rpcProxiesCollapsed',
        NODES_COLLAPSED: 'nodesCollapsed',
        NODES_NODE_TYPE: 'nodesNodeType',
    },
    OPERATIONS: {
        STATISTICS_AGGREGATION_TYPE: 'statisticsAggregationType',
        STATISTICS_ACTIVE_JOB_TYPES: 'statisticsActiveJobTypes',
    },
    NAVIGATION: {
        USE_SMART_SORT: 'useSmartSort',
        GROUP_NODES: 'groupNodes',
        ENABLE_PATH_AUTO_CORRECTION: 'enablePathAutocorrection',
        USE_SMART_FILTER: 'useSmartFilter',
        ROWS_PER_TABLE_PAGE: 'rowsPerTablePage',
        MAXIMUM_TABLE_STRING_SIZE: 'maximumTableStringSize',
        DEFAULT_TABLE_COLUMN_LIMIT: 'defaultTableColumnLimit',
        ENABLE_TABLE_SIMILARITY: 'enableTableSimilarity',
        CLUSTER_PAGE_PANE_SIZES: 'clusterPagePaneSizes',
        DEFAULT_CHYT_ALIAS: 'defaultChytAlias',
        TABLE_DISPLAY_RAW_STRINGS: 'tableDisplayRawStrings',
        ANNOTATION_VISIBILITY: 'annotationVisibility',
        QUEUE_PARTITIONS_VISIBILITY: 'queuePartitionsVisibility',
        QUEUE_CONSUMERS_VISIBILITY: 'queueConsumersVisibility',
        CONSUMER_PARTITIONS_VISIBILITY: 'consumerPartitionsVisibility',
    },
    A11Y: {
        USE_SAFE_COLORS: 'useSafeColors',
    },
    ACCOUNTS: {
        DASHBOARD_VISIBILITY_MODE: 'dashboardVisibilityMode',
        ACCOUNTS_VISIBILITY_MODE: 'accountsVisibilityMode',
        EXPAND_STATIC_CONFIGURATION: 'expandStaticConfiguration',
        ACCOUNTS_USAGE_VIEW_TYPE: 'accountUsageViewType',
        ACCOUNTS_USAGE_COLUMNS_TREE: 'accountUsageColumnsTree',
        ACCOUNTS_USAGE_COLUMNS_LIST: 'accountUsageColumnsList',
        ACCOUNTS_USAGE_COLUMNS_LIST_FOLDERS: 'accountUsageColumnsListFolders',
    },
    SCHEDULING: {
        EXPAND_STATIC_CONFIGURATION: 'expandStaticConfiguration',
    },
    QUERY_TRACKER: {
        STAGE: 'queryTrackerStage',
        YQL_AGENT_STAGE: 'yqlAgentStage',
        QUERIES_LIST_SIDEBAR_VISIBILITY_MODE: 'queriesListSidebarVisibilityMode',
    },
    CHYT: {
        LIST_COLUMNS: 'list_columns',
    },
} as const;

const GLOBAL = createNS('global');
const LOCAL = createNS('local');
const YSON = createNestedNS('yson', GLOBAL);
const DEVELOPMENT = createNestedNS('development', GLOBAL);
const SYSTEM = createNestedNS('system', GLOBAL);
const NAVIGATION = createNestedNS('navigation', GLOBAL);
const COMPONENTS = createNestedNS('components', GLOBAL);
const OPERATIONS = createNestedNS('operations', GLOBAL);
const OPERATION = createNestedNS('operation', GLOBAL);
const A11Y = createNestedNS('a11y', GLOBAL);
const MENU = createNestedNS('menu', GLOBAL);
const LAST_VISITED_CLUSTER = createNestedNS(SettingName.LOCAL.LAST_VISITED_CLUSTER, MENU);
const LAST_VISITED_PAGE = createNestedNS(SettingName.LOCAL.LAST_VISITED_PAGE, MENU);
const OPERATION_PRESETS = createNestedNS('presets', OPERATION);
const ACCOUNTS = createNestedNS('accounts', GLOBAL);
const SCHEDULING = createNestedNS('scheduling', GLOBAL);
const QUERY_TRACKER = createNestedNS('queryTracker', GLOBAL);
const CHYT = createNestedNS('chyt', GLOBAL);

// @depricated Please use `settings-types.ts` to add new options
export const NAMESPACES = {
    GLOBAL,
    LOCAL,
    YSON,
    DEVELOPMENT,
    SYSTEM,
    NAVIGATION,
    COMPONENTS,
    OPERATIONS,
    OPERATION,
    A11Y,
    MENU,
    LAST_VISITED_CLUSTER,
    LAST_VISITED_PAGE,
    OPERATION_PRESETS,
    ACCOUNTS,
    SCHEDULING,
    QUERY_TRACKER,
    CHYT,
};

export const FAVOURITES = 'favourites';
