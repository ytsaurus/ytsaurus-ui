import React from 'react';

import Button, {ButtonProps} from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';

const defaultProps: Partial<ButtonProps> = {
    view: 'flat-secondary',
    size: 'm',
};

export interface AttributesButtonProps extends ButtonProps {}

export default function AttributesButton(props: AttributesButtonProps) {
    return (
        <Button {...props}>
            <Icon awesome="at" />
        </Button>
    );
}

AttributesButton.defaultProps = defaultProps;
