import memoize_ from 'lodash/memoize';

import {RootState} from '../../../store/reducers';
import {accountsApi} from '../../../store/api/accounts';
import {getFavouriteAccounts} from '../../../store/selectors/favourites';
import {getCluster} from '../../../store/selectors/global/cluster';

import {createWidgetDataFieldSelector} from './utils';

export const getAccountsTypeFilter = createWidgetDataFieldSelector<
    'favourite' | 'usable' | 'custom'
>('type', 'favourite');

const createUsableAccountsSelector = memoize_((cluster: string) =>
    accountsApi.endpoints.usableAccounts.select({cluster}),
);

const createGetAccountsList = memoize_((widgetId: string) => {
    return (state: RootState, custom: string[]): string[] => {
        const type = getAccountsTypeFilter(state, widgetId);

        if (type === 'favourite') {
            const favourite = getFavouriteAccounts(state);
            return favourite?.length ? favourite.map((item) => item?.path) : [];
        }

        if (type === 'usable') {
            const cluster = getCluster(state);
            const usableAccountsSelector = createUsableAccountsSelector(cluster);
            const usableAccountsResult = usableAccountsSelector(state);
            return usableAccountsResult?.data || [];
        }

        return custom;
    };
});

export const getAccountsList = (state: RootState, widgetId: string, custom: string[]): string[] =>
    createGetAccountsList(widgetId)(state, custom);
