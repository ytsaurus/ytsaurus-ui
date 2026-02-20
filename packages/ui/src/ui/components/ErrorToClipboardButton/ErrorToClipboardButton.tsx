import React from 'react';
import {ClipboardButton, ClipboardButtonProps} from '@gravity-ui/uikit';

import {prettyPrintSafe} from '../../utils/unipika';

import {YTErrorBlockProps} from '../../components/Block/Block';
import {useErrorYsonSettings} from '../../hooks/useErrorYsonSettings';

export function ErrorToClipboardButton({
    error,
    ...rest
}: Pick<YTErrorBlockProps, 'error'> &
    Pick<ClipboardButtonProps, 'className' | 'size' | 'view' | 'children'>) {
    const errorSettings = useErrorYsonSettings();
    const text = React.useMemo(() => {
        return prettyPrintSafe(error, errorSettings);
    }, [error, errorSettings]);

    return <ClipboardButton title="Copy error" view="flat-secondary" text={text} {...rest} />;
}
