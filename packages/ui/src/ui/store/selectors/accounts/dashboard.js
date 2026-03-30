import map_ from 'lodash/map';
import {createSelector} from 'reselect';
import {
    getUsableAccounts,
    prepareAccountsFlattenTree,
} from '../../../store/selectors/accounts/accounts';
import {selectFavouriteAccounts} from '../../../store/selectors/favourites';
import {
    getAccountsVisibilityMode,
    getAccountsVisibilityModeOfDashboard,
} from '../../../store/selectors/settings';
import {filterFlattenTreeByViewContext} from '../../../utils/accounts';
import {getActiveAccount} from './accounts-ts';

export const selectUsableAccountsSet = createSelector([getUsableAccounts], (items) => {
    return new Set(items);
});

/**
 * This selector cannot be moved to 'store/selectors/accounts/accounts'
 * because of cyclic dependencies.
 */
export const selectFavouriteAccountsSet = createSelector([selectFavouriteAccounts], (items) => {
    return new Set(map_(items, 'path'));
});

export const selectFilteredAccountsOfDashboard = createSelector(
    [
        prepareAccountsFlattenTree,
        selectUsableAccountsSet,
        getAccountsVisibilityModeOfDashboard,
        selectFavouriteAccountsSet,
    ],
    filterFlattenTreeByViewContext,
);

export const selectFilteredAccounts = createSelector(
    [
        prepareAccountsFlattenTree,
        selectUsableAccountsSet,
        getAccountsVisibilityMode,
        selectFavouriteAccountsSet,
        getActiveAccount,
    ],
    filterFlattenTreeByViewContext,
);
