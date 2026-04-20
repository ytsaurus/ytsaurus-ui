import React from 'react';
import {ClipboardButton, type ClipboardButtonProps} from '@gravity-ui/uikit';

import {prettyPrintSafe} from '../../utils/unipika';

import {type YTErrorBlockProps} from '../../components/Block/Block';
import {useErrorYsonSettings} from '../../hooks/useErrorYsonSettings';
import i18n from './i18n';

export function ErrorToClipboardButton({
    error,
    ...rest
}: Pick<YTErrorBlockProps, 'error'> &
    Pick<ClipboardButtonProps, 'className' | 'size' | 'view' | 'children'>) {
    const errorSettings = useErrorYsonSettings();
    const text = React.useMemo(() => {
        return prettyPrintSafe(error, errorSettings);
    }, [error, errorSettings]);

    return (
        <ClipboardButton
            title={i18n('action_copy-error')}
            view="flat-secondary"
            text={text}
            {...rest}
        />
    );
}
