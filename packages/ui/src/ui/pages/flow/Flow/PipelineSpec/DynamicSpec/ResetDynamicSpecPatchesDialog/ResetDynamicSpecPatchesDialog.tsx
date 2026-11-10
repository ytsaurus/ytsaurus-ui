import React from 'react';

import {type Int64} from '../../../../../../../shared/yt-types';
import {type YTError} from '../../../../../../../@types/types';
import {YTDFDialog, makeErrorFields} from '../../../../../../containers/Dialog';

import i18n from '../../i18n';

export function ResetDynamicSpecPatchesDialog({
    version,
    onReset,
    onClose,
}: {
    version: Int64;
    onReset: (version: Int64) => Promise<void>;
    onClose: () => void;
}) {
    const [error, setError] = React.useState<YTError>();

    return (
        <YTDFDialog
            visible
            size="s"
            pristineSubmittable
            onClose={onClose}
            headerProps={{title: i18n('title_reset-patches')}}
            footerProps={{
                textApply: i18n('action_reset-patches'),
                textCancel: i18n('action_keep-patches'),
                propsButtonApply: {view: 'outlined-danger'},
            }}
            onAdd={async () => {
                setError(undefined);
                try {
                    await onReset(version);
                } catch (cause) {
                    setError(cause as YTError);
                    throw cause;
                }
            }}
            fields={[
                {
                    name: 'confirmation',
                    type: 'block',
                    extras: {children: i18n('context_reset-patches-confirm')},
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
}
