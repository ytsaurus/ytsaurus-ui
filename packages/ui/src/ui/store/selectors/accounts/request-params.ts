import {createSelector} from 'reselect';

import {type RootState} from '../../reducers';
import {selectCluster} from '../global';
import {selectFavouriteAccounts} from '../favourites';
import {selectAccountsVisibilityMode} from '../settings';
import {selectActiveAccount} from './accounts-ts';

const selectRequestedFavourites = createSelector(
    [
        (state: RootState) =>
            selectAccountsVisibilityMode(state) === 'favourites'
                ? selectFavouriteAccounts(state)
                : undefined,
    ],
    (favourites) => favourites?.map(({path}) => path).sort(),
);

export const selectAccountsRequestParams = createSelector(
    [
        selectCluster,
        selectAccountsVisibilityMode,
        (state: RootState) =>
            selectAccountsVisibilityMode(state) === 'all' ? undefined : selectActiveAccount(state),
        selectRequestedFavourites,
    ],
    (cluster, mode, activeAccount, favourites) => ({
        cluster,
        mode,
        activeAccount,
        favourites,
    }),
);
