import React from 'react';
import {ClipboardButton, ClipboardButtonProps} from '@gravity-ui/uikit';

import {prettyPrint} from '../../utils/unipika';

import {YTErrorBlockProps} from '../../components/Block/Block';
import {useErroYsonSettings} from '../../components/ErrorYsonSettingsContext/ErrorYsonSettingsContext';

export function ErrorToClipboardButton({
    settings,
    error,
    ...rest
}: Pick<YTErrorBlockProps, 'error' | 'settings'> &
    Pick<ClipboardButtonProps, 'className' | 'size' | 'view' | 'children'>) {
    const errorSettings = useErroYsonSettings();
    const text = React.useMemo(() => {
        try {
            if (settings) {
                return prettyPrint(error, {...settings, asHTML: false});
            }
            return prettyPrint(error, errorSettings);
        } catch {
            return JSON.stringify(error, null, 4);
        }
    }, [error, settings, errorSettings]);

    return <ClipboardButton title="Copy error" view="flat-secondary" text={text} {...rest} />;
}
