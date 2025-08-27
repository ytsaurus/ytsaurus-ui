import {YTApiId} from '../../../../../shared/constants/yt-api-id';

import {rootApi} from '../../../../store/api';

import {fetchAccounts} from './accounts';

const accountsWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        accounts: build.query({
            queryFn: fetchAccounts,
            providesTags: (_result, _error, arg) => [`${YTApiId.accountsDashboard}_${arg.id}`],
        }),
    }),
});

export const {useAccountsQuery} = accountsWidgetApi;
