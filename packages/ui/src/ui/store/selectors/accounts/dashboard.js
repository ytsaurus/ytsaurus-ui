import map_ from 'lodash/map';
import {createSelector} from 'reselect';
import {
    prepareAccountsFlattenTreeImpl,
    selectAccountsAbcServiceIdSlugFilter,
    selectAccountsNameFilter,
    selectAccountsSortInfo,
    selectUsableAccounts,
    sortFlattenTree,
} from '../../../store/selectors/accounts/accounts';
import {selectFavouriteAccounts} from '../../../store/selectors/favourites';
import {selectAccountsRequestedNames} from './visibility';
import {selectAccountsColumnFields, selectAccountsTree, selectActiveAccount} from './accounts-ts';

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

const selectVisibleAccountsTree = createSelector(
    [
        selectAccountsTree,
        selectActiveAccount,
        selectAccountsNameFilter,
        selectAccountsAbcServiceIdSlugFilter,
        selectAccountsRequestedNames,
    ],
    prepareAccountsFlattenTreeImpl,
);

export const selectFilteredAccounts = createSelector(
    [selectAccountsSortInfo, selectVisibleAccountsTree, selectAccountsColumnFields],
    sortFlattenTree,
);
