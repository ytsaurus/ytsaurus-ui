import {rootApi} from '..';
import {YTApiId} from '../../../rum/rum-wrap-api';
import {useEffectiveClusterArgs} from '../yt/utils';

import {
    type AccountEditorPathArgs,
    type AccountEditorTreeArgs,
    fetchAccountEditorPath,
    fetchAccountEditorTree,
} from './editor';
import {type AccountNamesArgs, fetchAccountNames} from './names';
import {
    type DeleteAccountArgs,
    type UpdateAccountAbcArgs,
    type UpdateAccountParentArgs,
    type UpdateAccountQuotaArgs,
    removeAccount,
    updateAccountAbc,
    updateAccountParent,
    updateAccountQuota,
} from './mutations';
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
        accountNames: build.query<string[], AccountNamesArgs>({
            queryFn: fetchAccountNames,
            providesTags: [YTApiId.listAccounts],
        }),
        updateAccountAbc: build.mutation<string, UpdateAccountAbcArgs>({
            queryFn: updateAccountAbc,
            invalidatesTags: (result) => (result ? [YTApiId.accountsEditData] : []),
        }),
        updateAccountParent: build.mutation<string, UpdateAccountParentArgs>({
            queryFn: updateAccountParent,
            invalidatesTags: (result) => (result ? [YTApiId.accountsEditData] : []),
        }),
        updateAccountQuota: build.mutation<string, UpdateAccountQuotaArgs>({
            queryFn: updateAccountQuota,
            invalidatesTags: (result) => (result ? [YTApiId.accountsEditData] : []),
        }),
        deleteAccount: build.mutation<string, DeleteAccountArgs>({
            queryFn: removeAccount,
            invalidatesTags: (result) =>
                result ? [YTApiId.accountsEditData, YTApiId.listAccounts] : [],
        }),
    }),
});

const {
    useAccountEditorPathQuery: useAccountEditorPathQueryBase,
    useAccountEditorTreeQuery: useAccountEditorTreeQueryBase,
    useAccountNamesQuery: useAccountNamesQueryBase,
    useDeleteAccountMutation,
    useUpdateAccountAbcMutation,
    useUpdateAccountParentMutation,
    useUpdateAccountQuotaMutation,
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

export function useAccountNamesQuery(args: AccountNamesArgs, options?: {skip?: boolean}) {
    return useAccountNamesQueryBase(useEffectiveClusterArgs(args), options);
}

export {
    useDeleteAccountMutation,
    useUpdateAccountAbcMutation,
    useUpdateAccountParentMutation,
    useUpdateAccountQuotaMutation,
};
