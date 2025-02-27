import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from 'react-redux';

import {
    getMaxContentWidth,
    isMaxContentWidthEnabled,
} from '../../store/selectors/global/max-content-width';

import './MaxContentWidth.scss';

const block = cn('yt-max-content-width');

export type MaxContentWidthProps = {
    children: React.ReactNode;
};

export function MaxContentWidth({children}: MaxContentWidthProps) {
    const enableMaxWidth = useSelector(isMaxContentWidthEnabled);
    const size = useSelector(getMaxContentWidth);

    return <div className={block({size: enableMaxWidth ? size : undefined})}>{children}</div>;
}
