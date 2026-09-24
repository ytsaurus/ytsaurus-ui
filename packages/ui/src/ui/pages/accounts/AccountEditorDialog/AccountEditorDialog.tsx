import React from 'react';

import Modal from '../../../components/Modal/Modal';
import {AccountEditor} from './AccountEditor';
import {type AccountEditorData} from './prepareAccountEditorData';

import './AccountEditorDialog.scss';

interface AccountEditorDialogProps {
    accountName: string;
    data: AccountEditorData;
    onClose(): void;
}

export function AccountEditorDialog({accountName, data, onClose}: AccountEditorDialogProps) {
    return (
        <Modal
            visible
            onCancel={onClose}
            content={<AccountEditor accountName={accountName} data={data} />}
            title={accountName}
            footer={false}
            size="l"
        />
    );
}
