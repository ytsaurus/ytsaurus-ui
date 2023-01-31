import _ from 'lodash';
import {stateToParams} from 'redux-location-state/lib/stateToParams';

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
    navigationParams,
    getNavigationPreparedState,
} from '../store/reducers/navigation/url-mapping';

import {
    versionsV2Params,
    getVersionsV2PreparedState,
} from './reducers/components/versions/url-mapping_v2';
import {
    proxiesParams,
    getProxiesPreparedState,
} from './reducers/components/proxies/proxies/url-mapping';
import {nodesParams, getNodesPreparedState} from './reducers/components/nodes/url-mapping';

import {
    statisticsParams,
    getStatisticsPreparedState,
} from './reducers/operations/statistics/url-mapping';
import {listParams, getListPreparedState} from './reducers/operations/list/url-mapping';
import {jobsParams, getJobsPreparedState} from './reducers/operations/jobs/url-mapping';

import {
    accountsParams,
    getAccountsPreparedState,
    accountOnlyParams,
    getAccountOnlyPreparedState,
    getAccountsUsageState,
    accountUsageParams,
} from './reducers/accounts/accounts/url-mapping';

import {dashboardParams, getDashboardPreparedState} from './reducers/dashboard/url-mapping';

import {globalParams, getGlobalPreparedState} from './reducers/url-mapping';

import {getGroupsPreparedState, groupsPageParams} from '../store/reducers/groups/url-mapping';

import {getUsersPreparedState, usersPageParams} from '../store/reducers/users/url-mapping';

import {
    pathViewerParams,
    getPathViewerPreparedState,
} from '../store/reducers/path-viewer/url-mapping';

import {tabletParams, getTabletPreparedState} from '../store/reducers/tablet/url-mapping';

import {
    schedulingOverviewParams,
    getSchedulingOverviewPreparedState,
    schedulingDetailsParams,
    getSchedulingDetailsPreparedState,
    getSchedulingAclPreparedState,
    schedulingAclParams,
    schedulingParams,
    getSchedulingPreparedState,
} from '../store/reducers/scheduling/url-mapping';
import {
    getTabletsBundlesPreparedState,
    getTabletsCellsPreparedState,
    tabletsAllBundlesParams,
    tabletsTabletCellsParams,
    tabletsBundlesParams,
} from './reducers/tablet_cell_bundles/url-mapping';
import {TabletsTab} from '../constants/tablets';
import {paramsToQuery} from '../utils';
import {getWindowStore} from './window-store';
import {RootState} from './reducers';
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

interface LocationWithState<T = RootState> {
    pathname: string;
    query: T;
}

const match = (path: string, locationPath: string) => {
    const allPathItems = locationPath.split('/');
    const initialDeclareditemSplit = path.split('/');
    const reducedInitialItem = [...initialDeclareditemSplit];
    let deleted = 0;

    _.each(initialDeclareditemSplit, (split, index) => {
        // if the item has a * remove that query from both the match and the item to match
        if (split === '*') {
            allPathItems.splice(index - deleted, 1);
            reducedInitialItem.splice(index - deleted, 1);
            deleted++;
        }
    });

    // match the final strings sans wildcards against each other
    return allPathItems.join('/') === reducedInitialItem.join('/');
};

export type LocationParameters = Record<string, ParameterDescription>;

export type MapLocationToStateFn<T = any> = (state: T, location: LocationWithState<T>) => T;
interface ParameterDescription<T = any> {
    stateKey: string;
    initialState?: T;
    type?: string;
    options?: {
        isFlags?: boolean;
        parse?: (v: string) => T | undefined;
        serialize?: (v: T) => string | number | undefined;
        shouldPush?: boolean;
    };
}

export type PathParameters = [LocationParameters, MapLocationToStateFn];

// prettier-ignore
const storeSetup: Array<[string, PathParameters]> = [
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
    [`/*/${Page.ACCOUNTS}/*`, [accountOnlyParams, getAccountOnlyPreparedState]],
    [`/*/${Page.ACCOUNTS}`, [accountOnlyParams, getAccountOnlyPreparedState]],

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

    [
        `/*/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_CELLS}`,
        [tabletsTabletCellsParams, getTabletsCellsPreparedState],
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
];

export function getParamSetup(): Record<string, LocationParameters> {
    const res = _.reduce(
        storeSetup,
        (acc, [key, [params]]) => {
            acc[key] = params;
            return acc;
        },
        {} as Record<string, LocationParameters>,
    );
    return res;
}

export function registerLocationParameters(path: string, data: PathParameters) {
    if (_.find(storeSetup, ([setupPath]) => setupPath === path)) {
        throw new Error(`Location parameters already defined for path '${path}'.`);
    }
    const matchedInd = _.findIndex(storeSetup, ([setupPath]) => match(setupPath, path));
    if (matchedInd !== -1) {
        storeSetup.splice(matchedInd, 0, [path, data]);
    } else {
        storeSetup.push([path, data]);
    }
}

export function mapLocationToState(state: RootState, location: LocationWithState) {
    const matchedState = _.find(storeSetup, ([path]) => match(path, location.pathname));
    const findState = matchedState
        ? matchedState
        : _.find(storeSetup, ([setupPath]) => setupPath === 'global');
    state = findState ? findState[1][1](state, location) : state;
    return state;
}

function makeRoutedURLByPath(pathname: string, paramOverrides: any = {}) {
    const {location} = stateToParams(getParamSetup(), getWindowStore().getState(), {
        pathname,
    });
    const {search} = location;
    const params = {...paramOverrides};
    new URLSearchParams(search).forEach((v, k) => {
        if (!_.has(params, k)) {
            params[k] = v;
        }
    });
    const p = _.isEmpty(params) ? '' : '?' + paramsToQuery(params);
    return `${pathname}${p}`;
}

export function makeRoutedURL(url: string, paramOverrides: any = {}) {
    let path = url;
    const qIndex = url.indexOf('?');
    let overrides = paramOverrides;
    if (-1 !== qIndex) {
        path = url.substr(0, qIndex);
        overrides = {...paramOverrides};
        new URLSearchParams(url.substr(qIndex)).forEach((v, key) => {
            overrides[key] = v;
        });
    }
    const res = makeRoutedURLByPath(path, overrides);
    return res;
}

export type MakeRotedUrlFnType = typeof makeRoutedURL;

(window as any).makeRoutedURL = makeRoutedURL;
