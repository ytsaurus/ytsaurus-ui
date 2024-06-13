import _ from 'lodash';

import {AccountsTab} from '../constants/accounts/accounts';
import {Tab as ComponentsTab} from '../constants/components/main';
import {Tab as OperationTab} from '../constants/operations/detail';
import {Tab as SchedulingTab} from '../constants/scheduling';
import {Page} from '../constants/index';

import {
    clustersMenuParams,
    getClustersMenuPreparedState,
} from './reducers/clusters-menu/url-mapping';

import {
    getNavigationPreparedState,
    navigationParams,
} from '../store/reducers/navigation/url-mapping';

import {
    getVersionsV2PreparedState,
    versionsV2Params,
} from './reducers/components/versions/url-mapping_v2';
import {
    getProxiesPreparedState,
    proxiesParams,
} from './reducers/components/proxies/proxies/url-mapping';
import {getNodesPreparedState, nodesParams} from './reducers/components/nodes/url-mapping';

import {
    getStatisticsPreparedState,
    statisticsParams,
} from './reducers/operations/statistics/url-mapping';
import {getListPreparedState, listParams} from './reducers/operations/list/url-mapping';
import {getJobsPreparedState, jobsParams} from './reducers/operations/jobs/url-mapping';

import {
    accountAclParams,
    accountOnlyParams,
    accountUsageParams,
    accountsParams,
    getAccountOnlyPreparedState,
    getAccountsAclState,
    getAccountsPreparedState,
    getAccountsUsageState,
} from './reducers/accounts/accounts/url-mapping';

import {dashboardParams, getDashboardPreparedState} from './reducers/dashboard/url-mapping';

import {getGlobalPreparedState, globalParams} from './reducers/url-mapping';

import {getGroupsPreparedState, groupsPageParams} from '../store/reducers/groups/url-mapping';

import {getUsersPreparedState, usersPageParams} from '../store/reducers/users/url-mapping';

import {
    getPathViewerPreparedState,
    pathViewerParams,
} from '../store/reducers/path-viewer/url-mapping';

import {getTabletPreparedState, tabletParams} from '../store/reducers/tablet/url-mapping';

import {
    getSchedulingAclPreparedState,
    getSchedulingDetailsPreparedState,
    getSchedulingOverviewPreparedState,
    getSchedulingPreparedState,
    schedulingAclParams,
    schedulingDetailsParams,
    schedulingOverviewParams,
    schedulingParams,
} from '../store/reducers/scheduling/url-mapping';
import {
    getTabletsBundlesAclPreparedState,
    getTabletsBundlesPreparedState,
    getTabletsCellsPreparedState,
    tabletsAllBundlesParams,
    tabletsBundlesAclParams,
    tabletsBundlesParams,
    tabletsTabletCellsParams,
} from './reducers/tablet_cell_bundles/url-mapping';
import {getSystemPreparedState, systemParams} from '../store/reducers/system/url-mapping';

import {TabletsTab} from '../constants/tablets';
import {
    chaosAllBundlesParams,
    chaosBundlesParams,
    chaosCellsParams,
    getChaosBundlesPreparedState,
    getChaosCellsPreparedState,
} from './reducers/chaos_cell_bundles/url-mapping';
import {
    draftQueryParameters,
    getDraftQueryParameters,
} from '../pages/query-tracker/module/query/url_mapping';

import {chytListParams, getGhytListPreparedState} from './reducers/chyt/url-mapping';

import {PathParameters} from './location';

// prettier-ignore
export const mainLocations:  Array<[string, PathParameters]> = [
    ['/', [clustersMenuParams, getClustersMenuPreparedState]],
    [`/*/${Page.NAVIGATION}`, [navigationParams, getNavigationPreparedState]],

    [
        `/*/${Page.COMPONENTS}/${ComponentsTab.VERSIONS}`,
        [versionsV2Params, getVersionsV2PreparedState],
    ],
    [`/*/${Page.COMPONENTS}/${ComponentsTab.NODES}`, [nodesParams, getNodesPreparedState]],
    [
        `/*/${Page.COMPONENTS}/${ComponentsTab.HTTP_PROXIES}`,
        [proxiesParams, getProxiesPreparedState],
    ],
    [
        `/*/${Page.COMPONENTS}/${ComponentsTab.RPC_PROXIES}`,
        [proxiesParams, getProxiesPreparedState],
    ],

    [`/*/${Page.OPERATIONS}`, [listParams, getListPreparedState]],
    [
        `/*/${Page.OPERATIONS}/*/${OperationTab.STATISTICS}`,
        [statisticsParams, getStatisticsPreparedState],
    ],
    [`/*/${Page.OPERATIONS}/*/${OperationTab.JOBS}`, [jobsParams, getJobsPreparedState]],

    [`/*/${Page.ACCOUNTS}/${AccountsTab.GENERAL}`, [accountsParams, getAccountsPreparedState]],
    [`/*/${Page.ACCOUNTS}/${AccountsTab.USAGE}`, [accountUsageParams, getAccountsUsageState]],
    [`/*/${Page.ACCOUNTS}/${AccountsTab.ACL}`, [accountAclParams, getAccountsAclState]],
    [`/*/${Page.ACCOUNTS}/*`, [accountOnlyParams, getAccountOnlyPreparedState]],
    [`/*/${Page.ACCOUNTS}`, [accountOnlyParams, getAccountOnlyPreparedState]],

    [`/*/${Page.CHYT}`, [chytListParams, getGhytListPreparedState]],

    [`/*/${Page.DASHBOARD}`, [dashboardParams, getDashboardPreparedState]],

    [`/*/${Page.PATH_VIEWER}`, [pathViewerParams, getPathViewerPreparedState]],

    [`/*/${Page.TABLET}/*`, [tabletParams, getTabletPreparedState]],

    [`/*/${Page.USERS}/*`, [usersPageParams, getUsersPreparedState]],

    [`/*/${Page.GROUPS}/*`, [groupsPageParams, getGroupsPreparedState]],

    [
        `/*/${Page.SCHEDULING}/${SchedulingTab.OVERVIEW}`,
        [schedulingOverviewParams, getSchedulingOverviewPreparedState],
    ],
    [
        `/*/${Page.SCHEDULING}/${SchedulingTab.DETAILS}`,
        [schedulingDetailsParams, getSchedulingDetailsPreparedState],
    ],
    [
        `/*/${Page.SCHEDULING}/${SchedulingTab.ACL}`,
        [schedulingAclParams, getSchedulingAclPreparedState],
    ],
    [`/*/${Page.SCHEDULING}`, [schedulingParams, getSchedulingPreparedState]],

    [`/*/${Page.SYSTEM}`, [systemParams, getSystemPreparedState]],

    [
        `/*/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_CELLS}`,
        [tabletsTabletCellsParams, getTabletsCellsPreparedState],
    ],

    [
        `/*/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.ACL}`,
        [tabletsBundlesAclParams, getTabletsBundlesAclPreparedState],
    ],

    [`/*/${Page.TABLET_CELL_BUNDLES}`, [tabletsAllBundlesParams, getTabletsBundlesPreparedState]],
    [`/*/${Page.TABLET_CELL_BUNDLES}/*`, [tabletsBundlesParams, getTabletsBundlesPreparedState]],

    [
        `/*/${Page.CHAOS_CELL_BUNDLES}/${TabletsTab.CHAOS_CELLS}`,
        [chaosCellsParams, getChaosCellsPreparedState],
    ],
    [`/*/${Page.CHAOS_CELL_BUNDLES}`, [chaosAllBundlesParams, getChaosBundlesPreparedState]],
    [`/*/${Page.CHAOS_CELL_BUNDLES}/*`, [chaosBundlesParams, getChaosBundlesPreparedState]],
    [`/*/${Page.QUERIES}`, [draftQueryParameters, getDraftQueryParameters]],

    ['global', [globalParams, getGlobalPreparedState]],
]
