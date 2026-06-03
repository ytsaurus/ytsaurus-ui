import find_ from 'lodash/find';
import sortBy_ from 'lodash/sortBy';

import {createSelector} from 'reselect';

import {
    selectAccountsNS,
    selectBundlesNS,
    selectChaosBundlesNS,
    selectChytNS,
    selectClusterNS,
    selectGetSetting,
    selectSchedulingNS,
} from '../../store/selectors/settings';
import {SettingName} from '../../../shared/constants/settings';
import {selectActiveAccount} from '../../store/selectors/accounts/accounts';
import {selectPath} from '../../store/selectors/navigation';
import {getPool, getTree} from '../../store/selectors/scheduling/scheduling';
import {selectTabletsActiveBundle} from './tablet_cell_bundles';
import {selectChaosActiveBundle} from './chaos_cell_bundles';
import {selectChytCurrentAlias} from './chyt';

//************* Selectors for Accounts *****************

export const selectFavouriteAccounts = createSelector(
    [selectGetSetting, selectAccountsNS],
    prepareFavourites,
);

export const selectLastVisitedAccounts = createSelector(
    [selectGetSetting, selectAccountsNS],
    prepareLastVisited,
);

export const selectPopularAccounts = createSelector([selectLastVisitedAccounts], preparePopulars);

export const selectIsActiveAccountInFavourites = createSelector(
    [selectActiveAccount, selectFavouriteAccounts],
    prepareIsInFavourites,
);

export const selectFavouriteChyt = createSelector(
    [selectGetSetting, selectChytNS],
    prepareFavourites,
);

export const selectLastVisitedChyt = createSelector(
    [selectGetSetting, selectChytNS],
    prepareLastVisited,
);

export const selectPopularChyt = createSelector([selectLastVisitedChyt], preparePopulars);

export const selectIsActiveCliqueInFavourites = createSelector(
    [selectChytCurrentAlias, selectFavouriteChyt],
    prepareIsInFavourites,
);

//************* Selectors for Navigation *****************

export const selectFavouritePaths = createSelector(
    [selectGetSetting, selectClusterNS],
    prepareFavourites,
);

export const selectLastVisitedPaths = createSelector(
    [selectGetSetting, selectClusterNS],
    prepareLastVisited,
);

export const selectPopularPaths = createSelector([selectLastVisitedPaths], preparePopulars);

export const selectIsCurrentPathInFavourites = createSelector(
    [selectPath, selectFavouritePaths],
    prepareIsInFavourites,
);

//************* Selectors for Scheduling *****************

export const selectFavouritePools = createSelector(
    [selectGetSetting, selectSchedulingNS],
    prepareFavourites,
);

export const selectIsActivePoolInFavourites = createSelector(
    [getPool, getTree, selectFavouritePools],
    prepareIsPoolInFavourites,
);

//************* Selectors for Bundles *****************

export const selectFavouriteBundles = createSelector(
    [selectGetSetting, selectBundlesNS],
    prepareFavourites,
);

export const selectIsActiveBundleInFavourites = createSelector(
    [selectTabletsActiveBundle, selectFavouriteBundles],
    prepareIsInFavourites,
);

// ************ Selectors for Chaos bundles ***********

export const selectFavouriteChaosBundles = createSelector(
    [selectGetSetting, selectChaosBundlesNS],
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
