import React from 'react';

import Tabs from '../../../components/Tabs/Tabs';
import {EDITOR_TABS} from '../../../constants/accounts/editor';
import {contentTabs} from '../../../utils/accounts/editor';
import {AccountGeneralEditor} from './AccountGeneralEditor';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';

export interface AccountEditorProps {
    accountName: string;
    data: AccountEditorData;
    onChanged(change: AccountEditorChange): void;
}

const generalTabs = contentTabs.filter(({value}: {value: string}) => value === EDITOR_TABS.general);

export function AccountEditor({accountName, data, onChanged}: AccountEditorProps) {
    const [activeTab, setActiveTab] = React.useState(EDITOR_TABS.general);

    return (
        <div className="account-editor-dialog__editor">
            <div className="account-editor-dialog__sidebar">
                <Tabs
                    items={generalTabs}
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
            </div>
        </div>
    );
}
