import React from 'react';

import cn from 'bem-cn-lite';

import './ColorCircle.scss';

const block = cn('yt-color-circle');

export function ColorCircle({color, marginRight = true}: {color: string; marginRight?: boolean}) {
    return (
        <div className={block({'margin-right': marginRight})} style={{backgroundColor: color}} />
    );
}
