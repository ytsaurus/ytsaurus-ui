import {createSelector} from 'reselect';

import {type RootState} from '../../reducers';
import {selectAccountsList} from './accounts-ts';
import {selectUsableAccounts} from './accounts';
import {selectAccountsRequestParams} from './request-params';
import {getAccountNamesWithParents} from '../../../utils/accounts/accounts-visibility';

export const selectAccountsRequestedNames = createSelector(
    [
        selectAccountsList,
        selectUsableAccounts,
        (state: RootState, params = selectAccountsRequestParams(state)) => params,
    ],
    (accounts, usableAccounts, {mode, favourites, activeAccount}) => {
        if (activeAccount || (mode !== 'usable' && mode !== 'favourites')) {
            return undefined;
        }

        const selected = mode === 'usable' ? usableAccounts : (favourites ?? []);
        return getAccountNamesWithParents(accounts, selected);
    },
);
