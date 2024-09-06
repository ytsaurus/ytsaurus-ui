import React from 'react';
import cn from 'bem-cn-lite';

import {Text} from '@gravity-ui/uikit';

import Icon from '../../components/Icon/Icon';
import {Tooltip} from '../Tooltip/Tooltip';

import './WarningIcon.scss';

const b = cn('yt-warning-icon');

interface Props {
    className?: string;
    hoverContent?: React.ReactNode;
    color?: 'warning' | 'danger';
    children?: React.ReactNode;
}

export default function WarningIcon(props: Props) {
    const {className, hoverContent, children, color} = props;
    return (
        <span className={b(null, className)}>
            <Tooltip className={b('tooltip')} content={hoverContent}>
                <Icon className={b('icon', {color})} awesome="exclamation-triangle" />
                {children && (
                    <Text variant="inherit" color={color}>
                        {children}
                    </Text>
                )}
            </Tooltip>
        </span>
    );
}
