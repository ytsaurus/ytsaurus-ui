import React from 'react';
import cn from 'bem-cn-lite';

import Icon from '../Icon/Icon';
import {Button} from '@gravity-ui/uikit';

import './ErrorIcon.scss';
import {showErrorPopup} from '../../utils/utils';

const b = cn('yt-error-icon');

interface Props {
    className?: string;
    error?: any;
}

export default function ErrorIcon(props: Props) {
    const {className, error} = props;
    return (
        <span className={b(null, className)}>
            <Button view="flat" size="s" pin="circle-circle" onClick={() => showErrorPopup(error)}>
                <Icon className={b('icon')} awesome="exclamation-circle" />
            </Button>
        </span>
    );
}
