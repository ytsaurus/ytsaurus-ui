import map_ from 'lodash/map';
import {createSelector} from 'reselect';
import {
    getUsableAccounts,
    prepareAccountsFlattenTree,
} from '../../../store/selectors/accounts/accounts';
import {getFavouriteAccounts} from '../../../store/selectors/favourites';
import {
    getAccountsVisibilityMode,
    getAccountsVisibilityModeOfDashboard,
} from '../../../store/selectors/settings';
import {filterFlattenTreeByViewContext} from '../../../utils/accounts';
import {getActiveAccount} from './accounts-ts';

export const getUsableAccountsSet = createSelector([getUsableAccounts], (items) => {
    return new Set(items);
});

/**
 * This selector cannot be moved to 'store/selectors/accounts/accounts'
 * because of cyclic dependencies.
 */
export const getFavouriteAccountsSet = createSelector([getFavouriteAccounts], (items) => {
    return new Set(map_(items, 'path'));
});

export const getFilteredAccountsOfDashboard = createSelector(
    [
        prepareAccountsFlattenTree,
        getUsableAccountsSet,
        getAccountsVisibilityModeOfDashboard,
        getFavouriteAccountsSet,
    ],
    filterFlattenTreeByViewContext,
);

export const getFilteredAccounts = createSelector(
    [
        prepareAccountsFlattenTree,
        getUsableAccountsSet,
        getAccountsVisibilityMode,
        getFavouriteAccountsSet,
        getActiveAccount,
    ],
    filterFlattenTreeByViewContext,
);
