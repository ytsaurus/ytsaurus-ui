import React from 'react';
import {Dialog, DialogProps} from '@gravity-ui/uikit';
import {useHotkeysScope} from '../../hooks/use-hotkeysjs-scope';

type DialogWrapperProps = DialogProps & {hotkeyScope?: string};

type DialogWrapperType = React.FC<DialogWrapperProps> & {
    Header: typeof Dialog.Header;
    Body: typeof Dialog.Body;
    Footer: typeof Dialog.Footer;
    Divider: typeof Dialog.Divider;
};

export const DialogWrapper: DialogWrapperType = (props) => {
    const {hotkeyScope = 'yt-dialog', ...restProps} = props;

    // We don't want to trigger any page hotkeys when dialog is visible,
    // therefore we switing to dialog hotkeys scope.
    useHotkeysScope(hotkeyScope, restProps.open);

    return <Dialog {...restProps} />;
};

DialogWrapper.Header = Dialog.Header;
DialogWrapper.Body = Dialog.Body;
DialogWrapper.Footer = Dialog.Footer;
DialogWrapper.Divider = Dialog.Divider;
