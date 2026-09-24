import React from 'react';

import Modal from '../../../components/Modal/Modal';
import {AccountEditor} from './AccountEditor';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';

import './AccountEditorDialog.scss';

interface AccountEditorDialogProps {
    accountName: string;
    data: AccountEditorData;
    onClose(): void;
    onChanged(change: AccountEditorChange): void;
    onDeleted(accountName: string): void;
}

export function AccountEditorDialog({
    accountName,
    data,
    onClose,
    onChanged,
    onDeleted,
}: AccountEditorDialogProps) {
    return (
        <Modal
            visible
            onCancel={onClose}
            content={
                <AccountEditor
                    accountName={accountName}
                    data={data}
                    onChanged={onChanged}
                    onClose={onClose}
                    onDeleted={onDeleted}
                />
            }
            title={accountName}
            footer={false}
            size="l"
        />
    );
}
