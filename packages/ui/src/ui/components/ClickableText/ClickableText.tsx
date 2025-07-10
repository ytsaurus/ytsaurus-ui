import React from 'react';
import cn from 'bem-cn-lite';

import {YTText} from '../../components/Text/Text';

const block = cn('yt-clickable-text');

export type ClickableTextProps = {
    className?: string;
    /**
     * 'info' is default value
     */
    color?: 'info' | 'secondary' | 'primary' | 'warning' | 'warning-light' | 'danger';
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    title?: string;
};

export function ClickableText({className, color = 'info', onClick, children}: ClickableTextProps) {
    return (
        <YTText className={block(null, className)} color={color} onClick={onClick}>
            {children}
        </YTText>
    );
}
