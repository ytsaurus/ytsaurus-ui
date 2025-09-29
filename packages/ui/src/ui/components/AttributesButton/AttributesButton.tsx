import React from 'react';

import Button, {ButtonProps} from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import {ButtonLinkProps} from '@gravity-ui/uikit';

export type AttributesButtonProps = Exclude<ButtonProps, ButtonLinkProps>;

export default function AttributesButton({
    view = 'flat-secondary',
    size = 'm',
    ...rest
}: AttributesButtonProps) {
    return (
        <Button view={view} size={size} {...rest}>
            <Icon awesome="at" />
        </Button>
    );
}
