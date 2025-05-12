import {rootApi} from '../../../../store/api';

import {accounts} from './accounts';

const accountsWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        accounts: build.query({
            queryFn: accounts,
        }),
    }),
});

export const {useAccountsQuery} = accountsWidgetApi;
