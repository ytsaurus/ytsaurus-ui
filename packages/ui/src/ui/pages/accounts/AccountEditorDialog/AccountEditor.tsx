import React from 'react';

import {type AccountEditorData} from './prepareAccountEditorData';

export interface AccountEditorProps {
    accountName: string;
    data: AccountEditorData;
}

export function AccountEditor(_props: AccountEditorProps) {
    return <div className="account-editor-dialog__content" />;
}
