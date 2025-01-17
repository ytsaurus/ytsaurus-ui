import React from 'react';
import cn from 'bem-cn-lite';

import './SettingsItemLayout.scss';

const block = cn('yt-settings-item');

export type SettingsItemLayotProps = {
    children: React.ReactNode;

    title?: string;
    description?: React.ReactNode;
    oneLine?: boolean;
};

export function SettingsItemLayot({title, children, description, oneLine}: SettingsItemLayotProps) {
    return (
        <div
            className={block({
                size: 's',
                'one-line': oneLine,
            })}
            title={title}
        >
            {children}
            <div className={block('annotation', 'elements-secondary-text')}>{description}</div>
        </div>
    );
}
