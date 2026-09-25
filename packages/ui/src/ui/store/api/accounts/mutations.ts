import {type YTError} from '../../../../@types/types';
import {deleteAccount, setAccountAbc, setAccountParent} from '../../../utils/accounts/editor';
import {type AccountQuotaParams, setAccountQuotaImpl} from '../../../utils/accounts/account-quota';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import accountsEditorI18n from '../../actions/accounts/i18n';

interface AccountMutationArgs {
    accountName: string;
    cluster: string;
}

export interface UpdateAccountAbcArgs extends AccountMutationArgs {
    abc?: {id?: number; slug?: string};
}

export interface UpdateAccountParentArgs extends AccountMutationArgs {
    parentName: string;
}

export type UpdateAccountQuotaArgs = AccountQuotaParams & {cluster: string};

export interface DeleteAccountArgs {
    accountName: string;
    cluster: string;
}

export async function updateAccountAbc({accountName, abc}: UpdateAccountAbcArgs) {
    try {
        await setAccountAbc(accountName, abc?.id, abc?.slug);
        return {data: accountName};
    } catch (error) {
        return {error: error as YTError};
    }
}

export async function updateAccountParent({accountName, parentName}: UpdateAccountParentArgs) {
    try {
        await setAccountParent(accountName, parentName);
        return {data: accountName};
    } catch (error) {
        return {error: error as YTError};
    }
}

export async function updateAccountQuota({cluster: _cluster, ...params}: UpdateAccountQuotaArgs) {
    try {
        await wrapApiPromiseByToaster(setAccountQuotaImpl(params), {
            toasterName: `${params.account}_${params.resourcePath}`,
            successContent: accountsEditorI18n('alert_quota-updated'),
        });
        return {data: params.account};
    } catch (error) {
        return {error: error as YTError};
    }
}

export async function removeAccount({accountName}: DeleteAccountArgs) {
    try {
        await deleteAccount(accountName);
        return {data: accountName};
    } catch (error) {
        return {error: error as YTError};
    }
}
