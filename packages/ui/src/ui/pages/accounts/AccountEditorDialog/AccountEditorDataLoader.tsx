import React from 'react';

import {type AccountEditorData} from './prepareAccountEditorData';
import {useAccountEditorData} from './useAccountEditorData';

export interface AccountEditorDataLoaderProps {
    accountName: string;
    cluster: string;
    onError(accountName: string, error: unknown): void;
    onLoaded(accountName: string, data: AccountEditorData): void;
}

export function AccountEditorDataLoader({
    accountName,
    cluster,
    onError,
    onLoaded,
}: AccountEditorDataLoaderProps) {
    const {data, error} = useAccountEditorData({cluster, accountName});

    React.useEffect(() => {
        if (data) {
            onLoaded(accountName, data);
        }
    }, [accountName, data, onLoaded]);

    React.useEffect(() => {
        if (error) {
            onError(accountName, error);
        }
    }, [accountName, error, onError]);

    return null;
}
