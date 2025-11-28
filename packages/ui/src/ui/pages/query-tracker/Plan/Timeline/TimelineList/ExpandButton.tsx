import React, {FC} from 'react';
import {ArrowToggle, Button} from '@gravity-ui/uikit';

type Props = {
    collapsed: boolean;
    onClick?: () => void;
};

export const ExpandButton: FC<Props> = ({collapsed, onClick}) => {
    return (
        <Button size="xs" view="flat" onClick={onClick}>
            <ArrowToggle size={16} direction={collapsed ? 'bottom' : 'top'} />
        </Button>
    );
};
