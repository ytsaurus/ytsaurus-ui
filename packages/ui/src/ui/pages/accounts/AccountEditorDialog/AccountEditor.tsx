import React from 'react';

import Button from '../../../components/Button/Button';
import Tabs from '../../../components/Tabs/Tabs';
import {EDITOR_TABS} from '../../../constants/accounts/editor';
import {contentTabs} from '../../../utils/accounts/editor';
import {AccountDeleteEditor} from './AccountDeleteEditor';
import {AccountGeneralEditor} from './AccountGeneralEditor';
import {AccountResourcesEditor} from './AccountResourcesEditor';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';
import i18n from './i18n';

export interface AccountEditorProps {
    accountName: string;
    data: AccountEditorData;
    onChanged(change: AccountEditorChange): void;
    onClose(): void;
    onDeleted(accountName: string): void;
}

const editorTabs = contentTabs;

export function AccountEditor({
    accountName,
    data,
    onChanged,
    onClose,
    onDeleted,
}: AccountEditorProps) {
    const [activeTab, setActiveTab] = React.useState(EDITOR_TABS.general);
    const [deleted, setDeleted] = React.useState(false);
    const account = data.accountsByName[accountName];

    if (deleted) {
        return <DeletedAccountMessage accountName={accountName} onClose={onClose} />;
    }

    return (
        <div className="account-editor-dialog__editor">
            <div className="account-editor-dialog__sidebar">
                <Tabs
                    items={editorTabs}
                    size="m"
                    layout="vertical"
                    active={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>
            <div className="account-editor-dialog__content pretty-scroll">
                {activeTab === EDITOR_TABS.general && (
                    <AccountGeneralEditor
                        accountName={accountName}
                        data={data}
                        onChanged={onChanged}
                    />
                )}
                {activeTab !== EDITOR_TABS.general && activeTab !== EDITOR_TABS.delete && (
                    <AccountResourcesEditor
                        accountName={accountName}
                        activeTab={activeTab}
                        data={data}
                        onChanged={onChanged}
                    />
                )}
                {activeTab === EDITOR_TABS.delete && account && (
                    <AccountDeleteEditor
                        account={account}
                        onDeleted={() => {
                            setDeleted(true);
                            onDeleted(accountName);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export function DeletedAccountMessage({
    accountName,
    onClose,
}: {
    accountName: string;
    onClose(): void;
}) {
    return (
        <div className="account-editor-dialog__deleted">
            <div>{i18n('alert_account-deleted', {accountName})}</div>
            <Button view="action" onClick={onClose}>
                {i18n('action_close')}
            </Button>
        </div>
    );
}
