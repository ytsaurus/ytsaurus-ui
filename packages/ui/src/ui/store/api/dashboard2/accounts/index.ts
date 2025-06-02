import {rootApi} from '../../../../store/api';

import {fetchAccounts} from './accounts';

const accountsWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        accounts: build.query({
            queryFn: fetchAccounts,
        }),
    }),
});

export const {useAccountsQuery} = accountsWidgetApi;
