import React, {FC} from 'react';
import {Button, ButtonButtonProps, Icon} from '@gravity-ui/uikit';
import ChevronsExpandUpRightIcon from '@gravity-ui/icons/svgs/chevrons-expand-up-right.svg';

export const ScaleButton: FC<Omit<ButtonButtonProps, 'size' | 'view'>> = (props) => {
    return (
        <Button size="xs" view="flat" {...props}>
            <Icon data={ChevronsExpandUpRightIcon} size={16} />
        </Button>
    );
};
