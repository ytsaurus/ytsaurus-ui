import React from 'react';
import {YTDFDialog} from '../../../containers/Dialog';
import i18n from '../i18n';

type Props = {
    onConfirm: () => void;
    onClose: () => void;
};

export function SidePanelReplacementConfirmationDialog({onConfirm, onClose}: Props) {
    return (
        <YTDFDialog
            visible
            pristineSubmittable
            headerProps={{title: i18n('title_replace-panel')}}
            footerProps={{
                textApply: i18n('action_close-and-continue'),
                textCancel: i18n('action_cancel'),
            }}
            fields={[
                {
                    type: 'block',
                    name: 'confirmation',
                    extras: {children: i18n('confirm_replace-panel')},
                },
            ]}
            onAdd={async () => onConfirm()}
            onClose={onClose}
        />
    );
}
