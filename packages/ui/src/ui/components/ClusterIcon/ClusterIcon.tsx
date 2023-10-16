import React from 'react';

import './ClusterIcon.scss';

import cn from 'bem-cn-lite';
const block = cn('cluster-icon');

export interface Props {
    icon?: string;
    className?: string;
    name?: string;
    forwardRef?: React.RefObject<HTMLImageElement>;
}

export default function ClusterIcon({icon, className, forwardRef, name}: Props) {
    const placeholder = name ? name.substring(0, 2).toUpperCase() : 'YT';
    return (
        <div className={block('wrapper', className)} ref={forwardRef}>
            {icon ? (
                <img src={icon} />
            ) : (
                <span className={block('placeholder')}>{placeholder}</span>
            )}
        </div>
    );
}
