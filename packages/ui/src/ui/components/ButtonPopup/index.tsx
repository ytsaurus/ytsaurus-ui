import React, {useRef, useState} from 'react';
import {Button, Icon, IconData, Popup, Text} from '@gravity-ui/uikit';
import closeIcon from '@gravity-ui/icons/svgs/xmark.svg';

import cn from 'bem-cn-lite';
import './ButtonPopup.scss';

const b = cn('button-popup');

type ButtonPopupProps = {
    icon: IconData;
    className?: string;
    header: React.ReactNode;
    children: React.ReactNode;
    counter?: number;
};

export const ButtonWithPopup = ({icon, className, header, children, counter}: ButtonPopupProps) => {
    const btnRef = useRef(null);
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(!open);
    return (
        <>
            <Button className={className} ref={btnRef} onClick={toggle} view="outlined" size="l">
                <Icon data={icon} size={16} />
                {counter ? <Text>{counter}</Text> : undefined}
            </Button>
            <Popup
                open={open}
                anchorRef={btnRef}
                placement={'bottom-start'}
                onOutsideClick={toggle}
            >
                <div className={b()}>
                    <div className={b('top-row')}>
                        {header}
                        <Button onClick={toggle} view="flat">
                            <Icon data={closeIcon} />
                        </Button>
                    </div>
                    {children}
                </div>
            </Popup>
        </>
    );
};
