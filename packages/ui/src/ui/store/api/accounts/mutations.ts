import {type YTError} from '../../../../@types/types';
import {setAccountAbc, setAccountParent} from '../../../utils/accounts/editor';

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
