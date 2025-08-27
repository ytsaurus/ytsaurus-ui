import React, {FC, PropsWithChildren} from 'react';
import cn from 'bem-cn-lite';
import {Button, Icon, Popup, PopupProps} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import './PopupWithCloseButton.scss';

const block = cn('popup-with-close-button');

type Props = Pick<PopupProps, 'anchorRef' | 'open'> & {
    className?: string;
    onClose: () => void;
};

export const PopupWithCloseButton: FC<PropsWithChildren<Props>> = ({
    anchorRef,
    open,
    onClose,
    children,
    className,
}) => {
    return (
        <Popup
            anchorRef={anchorRef}
            open={open}
            className={block(null, className)}
            onOutsideClick={onClose}
            placement="bottom"
            hasArrow
        >
            <Button view="flat" className={block('close-button')} onClick={onClose}>
                <Icon data={XmarkIcon} />
            </Button>
            {children}
        </Popup>
    );
};
