import React from 'react';

import {type YTError} from '../../../../@types/types';
import {ROOT_ACCOUNT_NAME} from '../../../constants/accounts/accounts';
import {selectCluster} from '../../../store/selectors/global';
import {useSelector} from '../../../store/redux-hooks';
import {showErrorPopup} from '../../../utils/utils';
import {toaster} from '../../../utils/toaster';
import {AccountEditorContext} from './AccountEditorContext';
import {
    AccountEditorDataLoader,
    type AccountEditorDataLoaderProps,
} from './AccountEditorDataLoader';
import {AccountEditorDialog} from './AccountEditorDialog';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';
import i18n from './i18n';

interface PendingRequest {
    accountName: string;
    reject(error: unknown): void;
    resolve(): void;
}

export interface AccountEditorHostProps {
    children: React.ReactNode;
    DataLoader?: React.ComponentType<AccountEditorDataLoaderProps>;
    onChanged?(change: AccountEditorChange): void;
    onDeleted?(accountName: string): void;
}

const NOOP = () => undefined;

export function AccountEditorHost({
    children,
    DataLoader = AccountEditorDataLoader,
    onChanged = NOOP,
    onDeleted = NOOP,
}: AccountEditorHostProps) {
    const cluster = useSelector(selectCluster);
    const [openingAccountName, setOpeningAccountName] = React.useState<string>();
    const [openedAccountName, setOpenedAccountName] = React.useState<string>();
    const [data, setData] = React.useState<AccountEditorData>();
    const [deleted, setDeleted] = React.useState(false);
    const currentAccountRef = React.useRef<string>();
    const pendingRequestRef = React.useRef<PendingRequest>();

    const openAccount = React.useCallback((accountName: string) => {
        if (currentAccountRef.current) {
            return Promise.reject(new Error(i18n('alert_editor-already-open')));
        }
        if (!accountName || accountName === ROOT_ACCOUNT_NAME) {
            return Promise.reject(new Error(i18n('alert_root-account')));
        }

        currentAccountRef.current = accountName;
        setDeleted(false);
        setOpeningAccountName(accountName);

        return new Promise<void>((resolve, reject) => {
            pendingRequestRef.current = {accountName, resolve, reject};
        });
    }, []);

    const closeAccount = React.useCallback(() => {
        currentAccountRef.current = undefined;
        pendingRequestRef.current = undefined;
        setOpeningAccountName(undefined);
        setOpenedAccountName(undefined);
        setData(undefined);
        setDeleted(false);
    }, []);

    const handleLoadError = React.useCallback((accountName: string, error: unknown) => {
        if (currentAccountRef.current !== accountName) {
            return;
        }

        toaster.add({
            name: `account_editor_${accountName}`,
            theme: 'danger',
            title: i18n('alert_load-failed', {accountName}),
            actions: [
                {
                    label: i18n('action_details'),
                    onClick: () => showErrorPopup(error as YTError),
                },
            ],
            autoHiding: false,
        });

        const isOpening = pendingRequestRef.current?.accountName === accountName;
        if (!isOpening) {
            return;
        }

        pendingRequestRef.current?.reject(error);
        pendingRequestRef.current = undefined;
        currentAccountRef.current = undefined;
        setOpeningAccountName(undefined);
        setOpenedAccountName(undefined);
        setData(undefined);
    }, []);

    const handleLoaded = React.useCallback(
        (accountName: string, loadedData: AccountEditorData) => {
            if (currentAccountRef.current !== accountName) {
                return;
            }

            if (!loadedData.accountsByName[accountName]) {
                const error = new Error(i18n('alert_account-not-found', {accountName}));
                handleLoadError(accountName, error);
                return;
            }

            setData(loadedData);
            if (pendingRequestRef.current?.accountName === accountName) {
                pendingRequestRef.current.resolve();
                pendingRequestRef.current = undefined;
                setOpeningAccountName(undefined);
                setOpenedAccountName(accountName);
            }
        },
        [handleLoadError],
    );

    const contextValue = React.useMemo(
        () => ({openingAccountName, openedAccountName, openAccount, closeAccount}),
        [closeAccount, openAccount, openedAccountName, openingAccountName],
    );
    const currentAccountName = openingAccountName || openedAccountName;
    const handleDeleted = React.useCallback(
        (accountName: string) => {
            setDeleted(true);
            onDeleted(accountName);
        },
        [onDeleted],
    );

    return (
        <AccountEditorContext.Provider value={contextValue}>
            {children}
            {currentAccountName && !deleted && (
                <DataLoader
                    accountName={currentAccountName}
                    cluster={cluster}
                    onError={handleLoadError}
                    onLoaded={handleLoaded}
                />
            )}
            {openedAccountName && data && (
                <AccountEditorDialog
                    accountName={openedAccountName}
                    data={data}
                    onClose={closeAccount}
                    onChanged={onChanged}
                    onDeleted={handleDeleted}
                />
            )}
        </AccountEditorContext.Provider>
    );
}
