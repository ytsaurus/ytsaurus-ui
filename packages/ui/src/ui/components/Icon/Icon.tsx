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

export interface IconProps {
    className?: string;
    awesome?: IconName;
    face?: 'solid' | 'light' | 'regular' | 'brands';
    spin?: boolean;
}

export default function Icon({className = '', face, awesome, spin}: IconProps) {
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

    return (
        <span
            ref={inputEl}
            className={`${block({
                'not-exist': !hasIcon,
                spin,
            })} icon icon_awesome ${className}`}
        >
            <KitIcon data={icon} size={size} />
        </span>
    );
}

Icon.displayName = 'Icon';
