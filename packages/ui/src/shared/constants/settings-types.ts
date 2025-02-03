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
    'global::navigation::clusterPagePaneSizes': number;
    'global::navigation::defaultChytAlias': string;
    'global::navigation::sqlService': Array<'qtkit' | 'yqlkit'>;
}

interface ComponentsSettings {
    'global::components::enableSideBar': boolean;
    'global::components::selectedColumns': Array<string>;
    'global::components::templates': unknown;
    'global::components::memoryPopupShowAll': boolean;
}

interface SystemSettings {
    'global::system::mastersHostType': 'container' | 'host';
    'global::system::nodesType': NodeType;
}

interface A11YSettings {
    'global::a11y::useSafeColors': boolean;
}

interface OperationsSettings {
    'global::operations::statisticsAggregationType': 'avg' | 'min' | 'max' | 'sum' | 'count';
}

interface AccountsSettings {
    'global::accounts::dashboardVisibilityMode': 'string';
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

interface OtherSettings {
    [key: string]: any;
}

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
    ComponentsSettings;

export type Settings = DescribedSettings & OtherSettings;

export type SettingKey = keyof DescribedSettings;
