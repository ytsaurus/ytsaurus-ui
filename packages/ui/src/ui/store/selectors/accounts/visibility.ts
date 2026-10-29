import {createSelector} from 'reselect';

import {type RootState} from '../../reducers';
import {selectFavouriteAccounts} from '../favourites';
import {selectAccountsVisibilityMode} from '../settings';
import {selectActiveAccount} from './accounts-ts';
import {getAccountNamesWithParents} from '../../../utils/accounts/accounts-visibility';

export const selectAccountsRequestedNames = createSelector(
    [
        (state: RootState) => state.accounts.accounts.accountList,
        (state: RootState) => state.accounts.accounts.usableAccounts,
        selectAccountsVisibilityMode,
        selectFavouriteAccounts,
        selectActiveAccount,
    ],
    (accounts, usableAccounts, mode, favourites, activeAccount) => {
        if (mode !== 'usable' && mode !== 'favourites') return undefined;

        const selected = mode === 'usable' ? usableAccounts : favourites.map(({path}) => path);
        return getAccountNamesWithParents(
            accounts,
            activeAccount ? [...selected, activeAccount] : selected,
        );
    },
);
