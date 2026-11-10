import React from 'react';

import {type Int64} from '../../../../../../../shared/yt-types';
import {type YTError} from '../../../../../../../@types/types';
import {YTDFDialog, makeErrorFields} from '../../../../../../containers/Dialog';

import i18n from '../../i18n';

type Props = {
    patch: Int64;
    version: Int64;
    onCancel: (patch: Int64, version: Int64) => Promise<void>;
    onClose: () => void;
};

export function CancelDynamicSpecPatchDialog({patch, version, onCancel, onClose}: Props) {
    const [error, setError] = React.useState<YTError>();

    return (
        <YTDFDialog
            visible
            size="s"
            pristineSubmittable
            onClose={onClose}
            headerProps={{title: i18n('title_cancel-patch')}}
            footerProps={{
                textApply: i18n('action_cancel-patch'),
                textCancel: i18n('action_keep-patch'),
                propsButtonApply: {view: 'outlined-danger'},
            }}
            onAdd={async () => {
                setError(undefined);
                try {
                    await onCancel(patch, version);
                } catch (cause) {
                    setError(cause as YTError);
                    throw cause;
                }
            }}
            fields={[
                {
                    name: 'confirmation',
                    type: 'block',
                    extras: {children: i18n('context_cancel-patch-confirm')},
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
}
