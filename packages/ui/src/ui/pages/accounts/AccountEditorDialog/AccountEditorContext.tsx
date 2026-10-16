import React from 'react';

export interface AccountEditorContextValue {
    openingAccountName?: string;
    openedAccountName?: string;
    openAccount(accountName: string): Promise<void>;
    closeAccount(): void;
}

export const AccountEditorContext = React.createContext<AccountEditorContextValue | undefined>(
    undefined,
);

export function useAccountEditor() {
    const value = React.useContext(AccountEditorContext);

    if (!value) {
        throw new Error('useAccountEditor must be used inside AccountEditorHost');
    }

    return value;
}
