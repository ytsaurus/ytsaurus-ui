import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Modal, ModalProps} from '@gravity-ui/uikit';
import {useHotkeysScope} from '../../hooks/use-hotkeysjs-scope';

type ModalWrapperProps = ModalProps & {hotkeyScope?: string};

export const ModalWrapper: React.FC<ModalWrapperProps> = (props) => {
    const {hotkeyScope = 'yt-modal', ...restProps} = props;

    // We don't want to trigger any page hotkeys when modal is visible,
    // therefore we switing to dialog hotkeys scope.
    useHotkeysScope(hotkeyScope, Boolean(restProps.open));

    return <Modal {...restProps} />;
};
