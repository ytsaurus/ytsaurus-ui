import _ from 'lodash';
import {createSelector} from 'reselect';

import {
    getAccountsNS,
    getChaosBundlesNS,
    getChytNS,
    getClusterNS,
    getSchedulingNS,
    makeGetSetting,
} from '../../store/selectors/settings';
import {SettingName} from '../../../shared/constants/settings';
import {getActiveAccount} from '../../store/selectors/accounts/accounts';
import {getPath} from '../../store/selectors/navigation';
import {getPool, getTree} from '../../store/selectors/scheduling/scheduling';
import {getBundlesNS} from './settings';
import {getTabletsActiveBundle} from './tablet_cell_bundles';
import {getChaosActiveBundle} from './chaos_cell_bundles';
import {getChytCurrrentClique} from './chyt';

//************* Selectors for Accounts *****************

export const getFavouriteAccounts = createSelector(
    [makeGetSetting, getAccountsNS],
    prepareFavourites,
);

export const getLastVisitedAccounts = createSelector(
    [makeGetSetting, getAccountsNS],
    prepareLastVisited,
);

export const getPopularAccounts = createSelector([getLastVisitedAccounts], preparePopulars);

export const isActiveAcountInFavourites = createSelector(
    [getActiveAccount, getFavouriteAccounts],
    prepareIsInFavourites,
);

export const getFavouriteChyt = createSelector([makeGetSetting, getChytNS], prepareFavourites);

export const getLastVisitedChyt = createSelector([makeGetSetting, getChytNS], prepareLastVisited);

export const getPopularChyt = createSelector([getLastVisitedChyt], preparePopulars);

export const isActiveCliqueInFavourites = createSelector(
    [getChytCurrrentClique, getFavouriteChyt],
    prepareIsInFavourites,
);

//************* Selectors for Navigation *****************

export const getFavouritePaths = createSelector([makeGetSetting, getClusterNS], prepareFavourites);

export const getLastVisitedPaths = createSelector(
    [makeGetSetting, getClusterNS],
    prepareLastVisited,
);

export const getPopularPaths = createSelector([getLastVisitedPaths], preparePopulars);

export const isCurrentPathInFavourites = createSelector(
    [getPath, getFavouritePaths],
    prepareIsInFavourites,
);

//************* Selectors for Scheduling *****************

export const getFavouritePools = createSelector(
    [makeGetSetting, getSchedulingNS],
    prepareFavourites,
);

export const isActivePoolInFavourites = createSelector(
    [getPool, getTree, getFavouritePools],
    prepareIsPoolInFavourites,
);

//************* Selectors for Bundles *****************

export const getFavouriteBundles = createSelector(
    [makeGetSetting, getBundlesNS],
    prepareFavourites,
);

export const isActiveBundleInFavourites = createSelector(
    [getTabletsActiveBundle, getFavouriteBundles],
    prepareIsInFavourites,
);

// ************ Selectors for Chaos bundles ***********

export const getFavouriteChaosBundles = createSelector(
    [makeGetSetting, getChaosBundlesNS],
    prepareFavourites,
);

export const isActiveChaosBundleInFavourites = createSelector(
    [getChaosActiveBundle, getFavouriteChaosBundles],
    prepareIsInFavourites,
);

//********************** Helpers *************************

function prepareFavourites(getSetting, parentNS) {
    const items = getSetting(SettingName.LOCAL.FAVOURITES, parentNS);
    return _.sortBy(items, 'path');
}

function prepareLastVisited(settingGetter, parentNS) {
    return settingGetter(SettingName.LOCAL.LAST_VISITED, parentNS) || [];
}

function preparePopulars(lastVisited) {
    return _.sortBy(lastVisited, (entry) => -entry.count);
}

function prepareIsInFavourites(value, favourites) {
    return Boolean(_.find(favourites, ({path}) => path === value));
}

function prepareIsPoolInFavourites(pool, tree, favourites) {
    return Boolean(_.find(favourites, ({path}) => path === `${pool}[${tree}]`));
}
