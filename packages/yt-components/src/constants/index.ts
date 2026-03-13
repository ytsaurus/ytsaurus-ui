import DataTable, {Settings} from '@gravity-ui/react-data-table';

export const HEADER_HEIGHT = 56;
export const TOOLBAR_COMPONENT_HEIGHT = 48;
export const STICKY_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT;
export const STICKY_DOUBLE_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT * 2;

export const DATA_TABLE_YT_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: HEADER_HEIGHT,
    stickyBottom: 0,
    syncHeadOnResize: true,
    dynamicRender: true,
    sortable: false,
    externalSort: true,
    dynamicRenderScrollParentGetter: () => window as any,
};

export const DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR: Settings = {
    ...DATA_TABLE_YT_SETTINGS,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
};

export const DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR_DOUBLE_HEIGHT: Settings = {
    ...DATA_TABLE_YT_SETTINGS,
    stickyTop: STICKY_DOUBLE_TOOLBAR_BOTTOM,
};

export const AccountsTab = {
    GENERAL: 'general',
    STATISTICS: 'statistics',
    MONITOR: 'monitor',
    USAGE: 'usage',
    ACL: 'acl',
};

export const TabletsTab = {
    INSTANCES: 'instances',
    PROXIES: 'proxies',
    TABLET_CELLS: 'tablet_cells',
    STATISTICS: 'statistics',
    MONITOR: 'monitor',
    ACL: 'acl',
    // We need to think if it is better to have separate set of tabs for active chaos-cell-bundle
    CHAOS_CELLS: 'chaos_cells',
    TABLET_ERRORS: 'tablet_errors',
} as const;

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
