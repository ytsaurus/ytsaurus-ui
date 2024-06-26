import React from 'react';
import cn from 'bem-cn-lite';

import './ActiveText.scss';

const block = cn('yt-active-text');

export type ActiveTextProps = {
    className?: string;
    /**
     * 'info' is default value
     */
    color?: 'info' | 'secondary' | 'primary';
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    title?: string;
};

export function ActiveText({className, color = 'info', onClick, children}: ActiveTextProps) {
    return (
        <span className={block({color}, className)} role="button" onClick={onClick}>
            {children}
        </span>
    );
}
