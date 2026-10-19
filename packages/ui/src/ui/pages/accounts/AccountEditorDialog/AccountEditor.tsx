import React from 'react';
import cn from 'bem-cn-lite';

import Tabs from '../../../components/Tabs/Tabs';
import {EDITOR_TABS} from '../../../constants/accounts/editor';
import {contentTabs} from '../../../utils/accounts/editor';
import {AccountDeleteEditor} from './AccountDeleteEditor';
import {AccountGeneralEditor} from './AccountGeneralEditor';
import {AccountResourcesEditor} from './AccountResourcesEditor';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';

export interface AccountEditorProps {
    accountName: string;
    data: AccountEditorData;
    onChanged(change: AccountEditorChange): void;
    onDeleted(accountName: string): void;
}

const block = cn('account-editor-dialog');
const editorTabs = contentTabs;

export function AccountEditor({accountName, data, onChanged, onDeleted}: AccountEditorProps) {
    const [activeTab, setActiveTab] = React.useState(EDITOR_TABS.general);
    const account = data.accountsByName[accountName];
    let content;
    if (activeTab === EDITOR_TABS.general) {
        content = <AccountGeneralEditor account={account} tree={data.tree} onChanged={onChanged} />;
    } else if (activeTab === EDITOR_TABS.delete) {
        content = (
            <AccountDeleteEditor account={account} onDeleted={() => onDeleted(accountName)} />
        );
    } else {
        content = (
            <AccountResourcesEditor
                accountName={accountName}
                activeTab={activeTab}
                data={data}
                onChanged={onChanged}
            />
        );
    }

    return (
        <div className={block('editor')}>
            <div className={block('sidebar')}>
                <Tabs
                    items={editorTabs}
                    size="m"
                    layout="vertical"
                    active={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>
            <div className={block('content', 'pretty-scroll')}>{content}</div>
        </div>
    );
}
