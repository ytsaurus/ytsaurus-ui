import {NodeType} from './system';

export interface Namespace {
    name: string;
    value: string;
    parent: Namespace | undefined;
}

export interface SettingName {
    [key: string]: {
        [key: string]: string;
    };
}

interface GlobalSettings {
    'global::theme': 'system' | 'light' | 'dark' | 'light-hc' | 'dark-hc';
    'global::autoRefresh': boolean;
    'global::fontType': string;
    'global::monacoVimMode': boolean;
    'global::maxContentWidth': 'standard' | 'wide' | 'maximum';
    'global::pagesOrder': Array<string>;
    'global::pagesPinned': Record<string, boolean>;
    'global::navigationPanelExpand': boolean | undefined;
}

interface YsonSettings {
    'global::yson::format': 'yson' | 'json' | 'raw-json';
    'global::yson::compact': boolean;
    'global::yson::escapeWhitespace': boolean;
    'global::yson::binaryAsHex': boolean;
    'global::yson::showDecoded': boolean;
}

interface DevelopmentSettings {
    'global::development::redirectToBeta': boolean;
    'global::development::redirectToBetaSwitched': boolean;
    'global::development::yqlTypes': boolean;
    'global::development::regularUserUI': boolean;
}

interface MenuSettings {
    'global::menu::startingPage': 'navigation' | 'operations' | 'dashboard' | 'system';
    'global::menu::preserveState': boolean;
    'global::menu::recentClustersFirst': boolean;
    'global::menu::recentPagesFirst': boolean;
}

interface NavigationSettings {
    'global::navigation::useSmartSort': boolean;
    'global::navigation::groupNodes': boolean;
    'global::navigation::enablePathAutocorrection': boolean;
    'global::navigation::useSmartFilter': boolean;
    'global::navigation::rowsPerTablePage': 10 | 50 | 100 | 200;
    'global::navigation::maximumTableStringSize': 1024 | 16384 | 32768 | 65536;
    'global::navigation::defaultTableColumnLimit': 10 | 50 | 100 | 200;
    'global::navigation::enableTableSimilarity': boolean;
    'global::navigation::clusterPagePaneSizes': number | undefined;
    'global::navigation::defaultChytAlias': string;
    'global::navigation::sqlService': Array<'qtkit' | 'yqlkit'>;
    'global::navigation::annotationVisibility': 'partial' | 'visible';

    'global::navigation::queuePartitionsVisibility': Array<string>;
    'global::navigation::queueConsumersVisibility': Array<string>;
    'global::navigation::consumerPartitionsVisibility': Array<string>;
}

interface ComponentsSettings {
    'global::components::enableSideBar': boolean;
    'global::components::selectedColumns': Array<string>;
    'global::components::templates': unknown;
    'global::components::memoryPopupShowAll': boolean;
}

interface SystemSettings {
    'global::system::mastersHostType': 'container' | 'host';
    'global::system::mastersCollapsed': boolean | undefined;
    'global::system::schedulersCollapsed': boolean | undefined;
    'global::system::chunksCollapsed': boolean | undefined;
    'global::system::httpProxiesCollapsed': boolean | undefined;
    'global::system::rpcProxiesCollapsed': boolean | undefined;
    'global::system::nodesCollapsed': boolean | undefined;
    'global::system::nodesNodeType': Array<NodeType> | undefined;
}

interface A11YSettings {
    'global::a11y::useSafeColors': boolean;
}

type OperationsSettings = OperationPresetsSettings & {
    'global::operations::statisticsAggregationType': 'avg' | 'min' | 'max' | 'sum' | 'count';
    'global::operations::statisticsActiveJobTypes': Record<string, string>;
};

export type OperationPresetsSettings = {
    [key in `global::operation::presets::${string}`]: OperationsListPreset;
};

export type OperationsListPreset = {
    name: string;
    filters: {
        failedJobs: boolean;
        permissions: Array<string>;
        pool: string;
        poolTree: string;
        state: string;
        subject: string;
        text: string;
        type: string;
        user: string;
    };
};

interface AccountsSettings {
    'global::accounts::dashboardVisibilityMode': undefined | 'all' | 'usable' | 'favourites';
    'global::accounts::accountsVisibilityMode': undefined | 'all' | 'usable' | 'favourites';
    'global::accounts::expandStaticConfiguration': boolean;

    'global::accounts::accountUsageViewType':
        | 'list'
        | 'tree'
        | 'list-plus-folders'
        | 'tree-diff'
        | 'list-diff'
        | 'list-plus-folders-diff';
    'global::accounts::accountUsageColumnsTree': Array<string>;
    'global::accounts::accountUsageColumnsList': Array<string>;
    'global::accounts::accountUsageColumnsListFolders': Array<string>;
}

export type Stage = string;

interface QueryTrackerSettings {
    'global::queryTracker::queriesListSidebarVisibilityMode': boolean;
    'global::queryTracker::history::Columns': string[];
    'global::queryTracker::useNewGraphView': boolean;
    'global::queryTracker::suggestions': boolean;
}

interface ChytSettings {
    'global::chyt::list_columns': Array<string>;
}

type QueryTrackerLastSelectedACOsSettings = {
    [key in `qt-stage::${Stage}::queryTracker::lastSelectedACOs`]: string[];
};

type QueryTrackerUserDefaultACOSettings = {
    [key in `qt-stage::${Stage}::queryTracker::defaultACO`]: string;
};

type SchedulingSettings = {
    'globa::scheduling::expandStaticConfiguration': boolean;
};

export interface DefaultSettings {
    GLOBAL: GlobalSettings;
    YSON: YsonSettings;
    DEVELOPMENT: DevelopmentSettings;
    SYSTEM: SystemSettings;
    OPERATIONS: OperationsSettings;
    NAVIGATION: NavigationSettings;
    A11Y: A11YSettings;
    MENU: MenuSettings;
    ACCOUNTS: AccountsSettings;
    QUERY_TRACKER: QueryTrackerSettings;
    CHYT: ChytSettings;
}

export type DescribedSettings = GlobalSettings &
    YsonSettings &
    DevelopmentSettings &
    SystemSettings &
    OperationsSettings &
    NavigationSettings &
    A11YSettings &
    MenuSettings &
    AccountsSettings &
    QueryTrackerSettings &
    ChytSettings &
    QueryTrackerLastSelectedACOsSettings &
    QueryTrackerUserDefaultACOSettings &
    ComponentsSettings &
    SchedulingSettings;

export type SettingKey = keyof DescribedSettings;
