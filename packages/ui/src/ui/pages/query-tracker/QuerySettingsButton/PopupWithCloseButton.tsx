import React, {FC, PropsWithChildren} from 'react';
import cn from 'bem-cn-lite';
import {Button, Icon, Popup} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import './PopupWithCloseButton.scss';

const block = cn('popup-with-close-button');

type Props = {
    anchorRef: React.RefObject<HTMLElement>;
    open: boolean;
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
            anchorElement={anchorRef.current}
            open={open}
            className={block(null, className)}
            onOpenChange={(isOpen, _event, reason) => {
                if (!isOpen && reason === 'outside-press') {
                    onClose();
                }
            }}
            placement="bottom"
        >
            <Button view="flat" className={block('close-button')} onClick={onClose}>
                <Icon data={XmarkIcon} />
            </Button>
            {children}
        </Popup>
    );
};
