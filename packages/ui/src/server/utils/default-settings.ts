import {YTCoreConfig} from '../../@types/core';
import {Page} from '../../shared/constants/settings';
import {DescribedSettings} from '../../shared/constants/settings-types';

const defaultUserSettings: Partial<DescribedSettings> = {
    'global::newDashboardPage': true,
    'global::theme': 'system',
    'global::fontType': '',
    'global::autoRefresh': true,
    'global::pagesOrder': [
        Page.NAVIGATION,
        Page.QUERIES,
        Page.OPERATIONS,
        Page.ACCOUNTS,
        Page.SCHEDULING,
        Page.TABLET_CELL_BUNDLES,
    ],
    'global::pagesPinned': {
        [Page.NAVIGATION]: true,
        [Page.QUERIES]: true,
        [Page.OPERATIONS]: true,
        [Page.ACCOUNTS]: true,
        [Page.SCHEDULING]: true,
        [Page.TABLET_CELL_BUNDLES]: true,
    },
    'global::maxContentWidth': 'maximum',
    'global::navigationPanelExpand': undefined as boolean | undefined,

    'global::yson::format': 'json',
    'global::yson::compact': false,
    'global::yson::escapeWhitespace': true,
    'global::yson::binaryAsHex': true,
    'global::yson::showDecoded': true,

    'global::development::redirectToBeta': false,
    'global::development::redirectToBetaSwitched': false,
    'global::development::yqlTypes': true,
    'global::development::regularUserUI': false,

    'global::system::mastersHostType': 'host',
    'global::system::mastersCollapsed': true,
    'global::system::schedulersCollapsed': true,
    'global::system::chunksCollapsed': true,
    'global::system::httpProxiesCollapsed': true,
    'global::system::rpcProxiesCollapsed': true,
    'global::system::cypressProxiesCollapsed': true,
    'global::system::nodesCollapsed': false,
    'global::system::nodesNodeType': undefined,

    'global::operations::statisticsAggregationType': 'avg',
    'global::operations::statisticsActiveJobTypes': {},

    'global::navigation::useSmartSort': true,
    'global::navigation::groupNodes': true,
    'global::navigation::enablePathAutocorrection': true,
    'global::navigation::useSmartFilter': false,
    'global::navigation::rowsPerTablePage': 100,
    'global::navigation::maximumTableStringSize': 1024,
    'global::navigation::defaultTableColumnLimit': 50,
    'global::navigation::enableTableSimilarity': false,
    'global::navigation::defaultChytAlias': '*ch_public',
    'global::navigation::sqlService': [],
    'global::navigation::annotationVisibility': 'partial',
    'global::navigation::clusterPagePaneSizes': undefined,
    'global::navigation::queuePartitionsVisibility': [],
    'global::navigation::queueConsumersVisibility': [],
    'global::navigation::consumerPartitionsVisibility': [],

    'global::components::enableSideBar': false,

    'global::a11y::useSafeColors': false,

    'global::menu::startingPage': 'navigation',
    'global::menu::preserveState': false,
    'global::menu::recentClustersFirst': true,
    'global::menu::recentPagesFirst': true,

    'global::scheduling::expandStaticConfiguration': false,

    'global::accounts::dashboardVisibilityMode': 'usable',
    'global::accounts::accountsVisibilityMode': 'all',
    'global::accounts::expandStaticConfiguration': true,
    'global::accounts::accountUsageViewType': 'tree',
    'global::accounts::accountUsageColumnsTree': [],
    'global::accounts::accountUsageColumnsList': [],
    'global::accounts::accountUsageColumnsListFolders': [],
};

export function getDefaultUserSettings(config: YTCoreConfig) {
    Object.assign(defaultUserSettings, config.defaultUserSettingsOverrides);
    return defaultUserSettings;
}
