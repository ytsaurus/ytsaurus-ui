import {rootApi} from '..';
import {YTApiId} from '../../../rum/rum-wrap-api';
import {useEffectiveClusterArgs} from '../yt/utils';
import {type OverrideDataType} from '../yt/types';

import {
    type AccountEditorTreeArgs,
    type AccountPathArgs,
    fetchAccountEditorTree,
    fetchAccountPath,
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

export const accountEditorTags = [YTApiId.accountPath, YTApiId.accountEditorTree];

export const accountsApi = rootApi
    .enhanceEndpoints({addTagTypes: [...accountEditorTags, YTApiId.listAccounts]})
    .injectEndpoints({
        endpoints: (build) => ({
            usableAccounts: build.query<string[] | undefined, {cluster: string}>({
                queryFn: fetchUsable,
            }),
            accountPath: build.query<string, AccountPathArgs>({
                queryFn: fetchAccountPath,
                providesTags: [YTApiId.accountPath],
            }),
            accountEditorTree: build.query<unknown, AccountEditorTreeArgs>({
                queryFn: fetchAccountEditorTree,
                providesTags: [YTApiId.accountEditorTree],
            }),
            accountNames: build.query<string[], AccountNamesArgs>({
                queryFn: fetchAccountNames,
                providesTags: [YTApiId.listAccounts],
            }),
            updateAccountAbc: build.mutation<string, UpdateAccountAbcArgs>({
                queryFn: updateAccountAbc,
                invalidatesTags: (result) => (result ? accountEditorTags : []),
            }),
            updateAccountParent: build.mutation<string, UpdateAccountParentArgs>({
                queryFn: updateAccountParent,
                invalidatesTags: (result) => (result ? accountEditorTags : []),
            }),
            updateAccountQuota: build.mutation<string, UpdateAccountQuotaArgs>({
                queryFn: updateAccountQuota,
                invalidatesTags: (result) => (result ? accountEditorTags : []),
            }),
            deleteAccount: build.mutation<string, DeleteAccountArgs>({
                queryFn: removeAccount,
                invalidatesTags: (result) =>
                    result ? [...accountEditorTags, YTApiId.listAccounts] : [],
            }),
        }),
    });

const {
    useAccountPathQuery: useAccountPathQueryBase,
    useAccountEditorTreeQuery: useAccountEditorTreeQueryBase,
    useAccountNamesQuery: useAccountNamesQueryBase,
    useDeleteAccountMutation,
    useUpdateAccountAbcMutation,
    useUpdateAccountParentMutation,
    useUpdateAccountQuotaMutation,
    useUsableAccountsQuery,
} = accountsApi;

export {useUsableAccountsQuery};

export function useAccountPathQuery(args: AccountPathArgs, options?: {skip?: boolean}) {
    return useAccountPathQueryBase(useEffectiveClusterArgs(args), {
        ...options,
        refetchOnMountOrArgChange: true,
    });
}

export function useAccountEditorTreeQuery<T>(
    args: AccountEditorTreeArgs,
    options?: {skip?: boolean},
) {
    const result = useAccountEditorTreeQueryBase(useEffectiveClusterArgs(args), {
        ...options,
        refetchOnMountOrArgChange: true,
    });
    return result as OverrideDataType<typeof result, T>;
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
