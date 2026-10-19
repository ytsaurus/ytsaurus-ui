import React from 'react';
import noop_ from 'lodash/noop';

import {type YTError} from '../../../../@types/types';
import {ROOT_ACCOUNT_NAME} from '../../../constants/accounts/accounts';
import {selectCluster} from '../../../store/selectors/global';
import {useSelector} from '../../../store/redux-hooks';
import {showErrorPopup} from '../../../utils/utils';
import {toaster} from '../../../utils/toaster';
import {AccountEditorContext} from './AccountEditorContext';
import {useAccountEditorData} from './useAccountEditorData';
import {AccountEditorDialog} from './AccountEditorDialog';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';
import i18n from './i18n';

interface EditorSession {
    accountName: string;
    openedAt: number;
    data?: AccountEditorData;
}

export interface AccountEditorHostProps {
    children: React.ReactNode;
    onChanged?(change: AccountEditorChange): void;
    onDeleted?(accountName: string): void;
}

export function AccountEditorHost({
    children,
    onChanged = noop_,
    onDeleted = noop_,
}: AccountEditorHostProps) {
    const cluster = useSelector(selectCluster);
    const [editor, setEditor] = React.useState<EditorSession>();
    const accountName = editor?.accountName;
    const {data, error, isFetching} = useAccountEditorData({
        cluster,
        accountName: accountName ?? '',
        openedAt: editor?.openedAt ?? 0,
        skip: !accountName,
    });
    const openingAccountName = editor && !editor.data ? accountName : undefined;
    const openedAccountName = editor?.data ? accountName : undefined;

    const openAccount = React.useCallback((name: string) => {
        if (!name || name === ROOT_ACCOUNT_NAME) {
            return;
        }
        setEditor((current) => current ?? {accountName: name, openedAt: Date.now()});
    }, []);

    const closeAccount = React.useCallback(() => {
        setEditor(undefined);
    }, []);

    React.useEffect(() => {
        if (!accountName || isFetching) {
            return;
        }

        const loadError =
            error ||
            (data && !data.accountsByName[accountName]
                ? new Error(i18n('alert_account-not-found', {accountName}))
                : undefined);

        if (loadError) {
            toaster.add({
                name: `account_editor_${accountName}`,
                theme: 'danger',
                title: i18n('alert_load-failed', {accountName}),
                actions: [
                    {
                        label: i18n('action_details'),
                        onClick: () => showErrorPopup(loadError as YTError),
                    },
                ],
                autoHiding: false,
            });
            // Keep the open dialog usable when a background refresh fails.
            setEditor((current) => (current?.data ? current : undefined));
        } else if (data) {
            setEditor((current) => {
                if (current?.accountName !== accountName || current.data === data) {
                    return current;
                }
                return {...current, data};
            });
        }
    }, [accountName, data, error, isFetching]);

    const contextValue = React.useMemo(
        () => ({openingAccountName, openedAccountName, openAccount, closeAccount}),
        [closeAccount, openAccount, openedAccountName, openingAccountName],
    );
    const handleDeleted = React.useCallback(
        (name: string) => {
            closeAccount();
            onDeleted(name);
        },
        [closeAccount, onDeleted],
    );

    return (
        <AccountEditorContext.Provider value={contextValue}>
            {children}
            {openedAccountName && editor?.data && (
                <AccountEditorDialog
                    accountName={openedAccountName}
                    data={editor.data}
                    onClose={closeAccount}
                    onChanged={onChanged}
                    onDeleted={handleDeleted}
                />
            )}
        </AccountEditorContext.Provider>
    );
}
