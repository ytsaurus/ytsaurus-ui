import map_ from 'lodash/map';
import {createSelector} from 'reselect';
import {
    selectAccountsFlattenTree,
    selectUsableAccounts,
} from '../../../store/selectors/accounts/accounts';
import {selectFavouriteAccounts} from '../../../store/selectors/favourites';
import {
    getAccountsVisibilityMode,
    getAccountsVisibilityModeOfDashboard,
} from '../../../store/selectors/settings';
import {filterFlattenTreeByViewContext} from '../../../utils/accounts';
import {selectActiveAccount} from './accounts-ts';

export const selectUsableAccountsSet = createSelector([selectUsableAccounts], (items) => {
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
        selectAccountsFlattenTree,
        selectUsableAccountsSet,
        getAccountsVisibilityModeOfDashboard,
        selectFavouriteAccountsSet,
    ],
    filterFlattenTreeByViewContext,
);

export const selectFilteredAccounts = createSelector(
    [
        selectAccountsFlattenTree,
        selectUsableAccountsSet,
        getAccountsVisibilityMode,
        selectFavouriteAccountsSet,
        selectActiveAccount,
    ],
    filterFlattenTreeByViewContext,
);
