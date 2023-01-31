import React from 'react';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';
import {Tooltip} from '../Tooltip/Tooltip';

import './WarningIcon.scss';

const b = cn('yt-warning-icon');

interface Props {
    className?: string;
    hoverContent?: React.ReactNode;
}

export default function WarningIcon(props: Props) {
    const {className, hoverContent} = props;
    return (
        <span className={b(null, className)}>
            <Tooltip className={b('tooltip')} content={hoverContent}>
                <Icon className={b('icon')} awesome="exclamation-triangle" />
            </Tooltip>
        </span>
    );
}
