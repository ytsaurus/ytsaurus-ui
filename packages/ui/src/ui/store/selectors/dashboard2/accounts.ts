import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '../../../store/reducers';
import {accountsApi} from '../../../store/api/accounts';
import {getFavouriteAccounts} from '../../../store/selectors/favourites';
import {getCluster} from '../../../store/selectors/global/cluster';

import {createWidgetDataFieldSelector} from './utils';

export const getAccountsTypeFilter = createWidgetDataFieldSelector<
    'favourite' | 'usable' | 'custom'
>('type', 'favourite');

const createGetAccountsList = (widgetId: string) =>
    createSelector(
        [
            (state: RootState) => getAccountsTypeFilter(state, widgetId),
            (state: RootState) => {
                const cluster = getCluster(state);
                return accountsApi.endpoints.usableAccounts.select({cluster})(state);
            },
            getFavouriteAccounts,
            (_, custom) => custom,
        ],
        (type, usable, favourite, custom) => {
            if (type === 'favourite') {
                return favourite?.length ? favourite.map((item) => item?.path) : [];
            }
            if (type === 'usable') {
                return usable?.data || [];
            }
            return custom;
        },
    );

export const getAccountsList = (state: RootState, widgetId: string, custom: string[]): string[] =>
    createGetAccountsList(widgetId)(state, custom);
