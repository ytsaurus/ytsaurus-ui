import React from 'react';
import cn from 'bem-cn-lite';

import i18n from './i18n';

import './PermissionsWarning.scss';

const block = cn('yt-permissions-warning');

export interface PermissionsWarningProps {
    className?: string;
}

const PermissionsWarning = ({className}: PermissionsWarningProps) => {
    return <div className={block(null, className)}></div>;
};

export const PoolPermissionsWarning = ({className}: {className?: string}) => {
    return (
        <PermissionsWarning className={className}>
            {i18n('context_pool-permissions-warning-prefix')}{' '}
            <span className={block('flag')}>{i18n('label_inherit-acl-flag')}</span>{' '}
            {i18n('context_pool-permissions-warning-suffix')}
        </PermissionsWarning>
    );
};

export const AutoManagedPoolWarning = ({className}: {className?: string}) => {
    return (
        <PermissionsWarning className={className}>
            {i18n('context_auto-managed-pool')}
        </PermissionsWarning>
    );
};
