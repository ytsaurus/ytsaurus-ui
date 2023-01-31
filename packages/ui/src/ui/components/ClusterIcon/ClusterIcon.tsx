import React from 'react';
import PropTypes from 'prop-types';
import {defaultClusterAppearance as dca} from '../../appearance';
import './ClusterIcon.scss';

import cn from 'bem-cn-lite';
const block = cn('cluster-icon');

export interface Props {
    icon?: string;
    size?: string;
    className?: string;
    theme?: string;
    name?: string;
    forwardRef?: React.RefObject<HTMLImageElement>;
}

export default function ClusterIcon({icon, size, className, forwardRef, theme, name}: Props) {
    const placeholder = name ? name.substring(0, 2).toUpperCase() : 'YT';
    return (
        <div className={block('wrapper', theme)}>
            <img
                ref={forwardRef}
                className={className}
                src={icon}
                onError={(e) => {
                    (e.target as any).src = size === 's' ? dca.icon : dca.icon2x;
                }}
            />
            <span className={block('placeholder')}>{placeholder}</span>
        </div>
    );
}

ClusterIcon.propTypes = {
    icon: PropTypes.string.isRequired,
    className: PropTypes.string,
    size: PropTypes.string,
    theme: PropTypes.string,
    name: PropTypes.string,
    forwardRef: PropTypes.any,
};
