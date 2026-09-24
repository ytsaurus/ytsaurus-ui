import {rootApi} from '..';
import {YTApiId} from '../../../rum/rum-wrap-api';
import {useEffectiveClusterArgs} from '../yt/utils';

import {
    type AccountEditorPathArgs,
    type AccountEditorTreeArgs,
    fetchAccountEditorPath,
    fetchAccountEditorTree,
} from './editor';
import {fetchUsable} from './usable';

export const accountsApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        usableAccounts: build.query<string[] | undefined, {cluster: string}>({
            queryFn: fetchUsable,
        }),
        accountEditorPath: build.query<string, AccountEditorPathArgs>({
            queryFn: fetchAccountEditorPath,
            providesTags: [YTApiId.accountsEditData],
        }),
        accountEditorTree: build.query<unknown, AccountEditorTreeArgs>({
            queryFn: fetchAccountEditorTree,
            providesTags: [YTApiId.accountsEditData],
        }),
    }),
});

const {
    useAccountEditorPathQuery: useAccountEditorPathQueryBase,
    useAccountEditorTreeQuery: useAccountEditorTreeQueryBase,
    useUsableAccountsQuery,
} = accountsApi;

export {useUsableAccountsQuery};

export function useAccountEditorPathQuery(args: AccountEditorPathArgs, options?: {skip?: boolean}) {
    return useAccountEditorPathQueryBase(useEffectiveClusterArgs(args), options);
}

export function useAccountEditorTreeQuery<T>(
    args: AccountEditorTreeArgs,
    options?: {skip?: boolean},
) {
    return useAccountEditorTreeQueryBase(useEffectiveClusterArgs(args), options) as Omit<
        ReturnType<typeof useAccountEditorTreeQueryBase>,
        'data' | 'currentData'
    > & {
        data?: T;
        currentData?: T;
    };
}
