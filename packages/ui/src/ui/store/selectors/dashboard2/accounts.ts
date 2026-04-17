import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '../../../store/reducers';
import {accountsApi} from '../../../store/api/accounts';
import {selectFavouriteAccounts} from '../../../store/selectors/favourites';
import {selectCluster} from '../../../store/selectors/global/cluster';

import {createWidgetDataFieldSelector} from './utils';

export const getAccountsTypeFilter = createWidgetDataFieldSelector<
    'favourite' | 'usable' | 'custom'
>('type', 'favourite');

const selectCustomAccountsList = (_state: RootState, _widgetId: string, custom: string[]) => custom;

const selectUsableAccountsImpl = (state: RootState, cluster: string) =>
    accountsApi.endpoints.usableAccounts.select({cluster})(state)?.data;

const selectUsableAccounts = (state: RootState) => {
    const cluster = selectCluster(state);

    return selectUsableAccountsImpl(state, cluster);
};

export const selectAccountsList = createSelector(
    [
        selectFavouriteAccounts,
        selectUsableAccounts,
        selectCustomAccountsList,
        getAccountsTypeFilter,
    ],
    (favourite, usable, custom, type) => {
        if (type === 'favourite') {
            return favourite?.length ? favourite.map((item) => item?.path) : [];
        }
        if (type === 'usable') {
            return usable || [];
        }

        return custom;
    },
);
