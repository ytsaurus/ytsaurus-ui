import React, {FC} from 'react';
import {Button, Icon, IconData} from '@gravity-ui/uikit';
import './ZoomButton.scss';
import cn from 'bem-cn-lite';

const block = cn('yt-zoom-button');

type ButtonProps = {
    icon: IconData;
    disabled: boolean;
    onClick: () => void;
};

export const ZoomButton: FC<ButtonProps> = ({icon, disabled, onClick}) => {
    return (
        <Button
            view="flat"
            pin="clear-clear"
            width="max"
            className={block()}
            disabled={disabled}
            onClick={onClick}
        >
            <Icon data={icon} size={16} />
        </Button>
    );
};
