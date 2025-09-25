import React from 'react';

import Button, {ButtonProps} from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';

export type AttributesButtonProps = ButtonProps;

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
