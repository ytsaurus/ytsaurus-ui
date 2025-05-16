import {rootApi} from '..';

import {usable} from './usable';

export const accountsApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        usableAccounts: build.query<string[] | undefined, void>({
            queryFn: usable,
        }),
    }),
});

export const {useUsableAccountsQuery} = accountsApi;
