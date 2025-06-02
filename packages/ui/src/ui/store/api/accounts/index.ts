import {rootApi} from '..';

import {fetchUsable} from './usable';

export const accountsApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        usableAccounts: build.query<string[] | undefined, void>({
            queryFn: fetchUsable,
        }),
    }),
});

export const {useUsableAccountsQuery} = accountsApi;
