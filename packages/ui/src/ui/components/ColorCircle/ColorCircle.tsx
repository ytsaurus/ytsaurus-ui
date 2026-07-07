import React from 'react';
import {type ProgressTheme} from '@gravity-ui/uikit';

import cn from 'bem-cn-lite';

import {getProgressThemeColor} from '../../utils/progress';

import './ColorCircle.scss';

const block = cn('yt-color-circle');

export type ColorCircleProps = {
    color?: string;
    theme?: ProgressTheme;
    marginRight?: boolean;
};

export function ColorCircle({color, theme, marginRight = true}: ColorCircleProps) {
    const backgroundColor = theme ? getProgressThemeColor(theme) : color;

    return <div className={block({'margin-right': marginRight})} style={{backgroundColor}} />;
}
