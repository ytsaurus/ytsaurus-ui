import find_ from 'lodash/find';
import sortBy_ from 'lodash/sortBy';

import {createSelector} from 'reselect';

import {
    getAccountsNS,
    getBundlesNS,
    getChytNS,
    getClusterNS,
    getSchedulingNS,
    makeGetSetting,
    selectChaosBundlesNS,
} from '../../store/selectors/settings';
import {SettingName} from '../../../shared/constants/settings';
import {selectActiveAccount} from '../../store/selectors/accounts/accounts';
import {getPath} from '../../store/selectors/navigation';
import {getPool, getTree} from '../../store/selectors/scheduling/scheduling';
import {selectTabletsActiveBundle} from './tablet_cell_bundles';
import {selectChaosActiveBundle} from './chaos_cell_bundles';
import {selectChytCurrentAlias} from './chyt';

//************* Selectors for Accounts *****************

export const selectFavouriteAccounts = createSelector(
    [makeGetSetting, getAccountsNS],
    prepareFavourites,
);

export const selectLastVisitedAccounts = createSelector(
    [makeGetSetting, getAccountsNS],
    prepareLastVisited,
);

export const selectPopularAccounts = createSelector([selectLastVisitedAccounts], preparePopulars);

export const selectIsActiveAccountInFavourites = createSelector(
    [selectActiveAccount, selectFavouriteAccounts],
    prepareIsInFavourites,
);

export const selectFavouriteChyt = createSelector([makeGetSetting, getChytNS], prepareFavourites);

export const selectLastVisitedChyt = createSelector(
    [makeGetSetting, getChytNS],
    prepareLastVisited,
);

export const selectPopularChyt = createSelector([selectLastVisitedChyt], preparePopulars);

export const selectIsActiveCliqueInFavourites = createSelector(
    [selectChytCurrentAlias, selectFavouriteChyt],
    prepareIsInFavourites,
);

//************* Selectors for Navigation *****************

export const selectFavouritePaths = createSelector(
    [makeGetSetting, getClusterNS],
    prepareFavourites,
);

export const selectLastVisitedPaths = createSelector(
    [makeGetSetting, getClusterNS],
    prepareLastVisited,
);

export const selectPopularPaths = createSelector([selectLastVisitedPaths], preparePopulars);

export const selectIsCurrentPathInFavourites = createSelector(
    [getPath, selectFavouritePaths],
    prepareIsInFavourites,
);

//************* Selectors for Scheduling *****************

export const selectFavouritePools = createSelector(
    [makeGetSetting, getSchedulingNS],
    prepareFavourites,
);

export const selectIsActivePoolInFavourites = createSelector(
    [getPool, getTree, selectFavouritePools],
    prepareIsPoolInFavourites,
);

//************* Selectors for Bundles *****************

export const selectFavouriteBundles = createSelector(
    [makeGetSetting, getBundlesNS],
    prepareFavourites,
);

export const selectIsActiveBundleInFavourites = createSelector(
    [selectTabletsActiveBundle, selectFavouriteBundles],
    prepareIsInFavourites,
);

// ************ Selectors for Chaos bundles ***********

export const selectFavouriteChaosBundles = createSelector(
    [makeGetSetting, selectChaosBundlesNS],
    prepareFavourites,
);

export const selectIsActiveChaosBundleInFavourites = createSelector(
    [selectChaosActiveBundle, selectFavouriteChaosBundles],
    prepareIsInFavourites,
);

//********************** Helpers *************************

function prepareFavourites(getSetting, parentNS) {
    const items = getSetting(SettingName.LOCAL.FAVOURITES, parentNS);
    return sortBy_(items, 'path');
}

function prepareLastVisited(settingGetter, parentNS) {
    return settingGetter(SettingName.LOCAL.LAST_VISITED, parentNS) || [];
}

function preparePopulars(lastVisited) {
    return sortBy_(lastVisited, (entry) => -entry.count);
}

function prepareIsInFavourites(value, favourites) {
    return Boolean(find_(favourites, ({path}) => path === value));
}

function prepareIsPoolInFavourites(pool, tree, favourites) {
    return Boolean(find_(favourites, ({path}) => path === `${pool}[${tree}]`));
}
