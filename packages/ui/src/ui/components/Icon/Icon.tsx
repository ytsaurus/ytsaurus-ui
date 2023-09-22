import React, {useEffect, useMemo, useRef, useState} from 'react';
import cn from 'bem-cn-lite';
import {Icon as KitIcon} from '@gravity-ui/uikit';
import {iconNames as iconNamesYt} from './importIcons';
import {iconNames as iconNamesGravity} from './importGravityIcons';

import './Icon.scss';

const iconNames = {
    ...iconNamesYt,
    ...iconNamesGravity,
};

export type IconName = keyof typeof iconNames;

const block = cn('yt-icon');

const findNameInClass = (classValue: string): string | null => {
    try {
        const name = classValue.split('fa-').splice(1).join('');
        return name;
    } catch {
        return null;
    }
};

const iconSizes = {
    s: 10,
    m: 13,
    l: 16,
    xl: 18,
};

const getNumberSize = (size: number | 's' | 'm' | 'l' | 'xl') => {
    if (typeof size === 'string') {
        return iconSizes[size];
    }
    return size;
};

export interface IconProps {
    className?: string;
    awesome?: IconName;
    face?: 'solid' | 'light' | 'regular' | 'brands';
    spin?: boolean;
    size?: number | 's' | 'm' | 'l' | 'xl';
}

export default function Icon({className = '', face, awesome, spin, size: propSize}: IconProps) {
    const inputEl = useRef(null);
    const [size, setSize] = useState(13);

    useEffect(() => {
        if (inputEl.current) {
            const spanStyle = window
                .getComputedStyle(inputEl.current, null)
                .getPropertyValue('font-size');
            const fontSize = parseFloat(spanStyle);
            if (size !== fontSize) setSize(fontSize);
        }
    }, []);

    const iconName: string | null = awesome ? awesome : findNameInClass(className);

    const icon = useMemo(() => {
        if (iconName !== null && iconName in iconNames) {
            return iconNames[iconName as IconName];
        } else {
            return iconNames['question-circle'];
        }
    }, [awesome, className, face, iconName]);

    const hasIcon: boolean = iconName !== null && iconName in iconNames;

    const iconsSize = propSize ? getNumberSize(propSize) : size;
    return (
        <span
            ref={inputEl}
            className={`${block({
                'not-exist': !hasIcon,
                spin,
                name: iconName || undefined,
            })} icon icon_awesome ${className}`}
        >
            <KitIcon data={icon} size={iconsSize} />
        </span>
    );
}

Icon.displayName = 'Icon';
