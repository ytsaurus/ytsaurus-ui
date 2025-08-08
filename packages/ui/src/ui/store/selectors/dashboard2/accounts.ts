import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '../../../store/reducers';
import {accountsApi} from '../../../store/api/accounts';
import {getFavouriteAccounts} from '../../../store/selectors/favourites';
import {getCluster} from '../../../store/selectors/global/cluster';

import {createWidgetDataFieldSelector} from './utils';

export const getAccountsTypeFilter = createWidgetDataFieldSelector<
    'favourite' | 'usable' | 'custom'
>('type', 'favourite');

const getCustomAccountsList = (_state: RootState, _widgetId: string, custom: string[]) => custom;

const getUsableAccountsImpl = (state: RootState, cluster: string) =>
    accountsApi.endpoints.usableAccounts.select({cluster})(state)?.data;

const getUsableAccounts = (state: RootState) => {
    const cluster = getCluster(state);
    return getUsableAccountsImpl(state, cluster);
};

export const getAccountsList = createSelector(
    [getFavouriteAccounts, getUsableAccounts, getCustomAccountsList, getAccountsTypeFilter],
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
