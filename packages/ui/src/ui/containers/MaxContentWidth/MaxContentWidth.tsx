import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from 'react-redux';

import {
    getMaxContentWidth,
    isMaxContentWidthEnabled,
} from '../../store/selectors/global/max-content-width';
import {RootState} from '../../store/reducers/index';

import './MaxContentWidth.scss';

const block = cn('yt-max-content-width');

export type MaxContentWidthProps = {
    children: React.ReactNode;
};

export function MaxContentWidth({children}: MaxContentWidthProps) {
    const enableMaxWidth = useSelector(isMaxContentWidthEnabled);
    const size = useSelector(getMaxContentWidth);
    const isSplit = useSelector((state: RootState) => state.global.splitScreen.isSplit);

    return (
        <div className={block({size: !isSplit && enableMaxWidth ? size : undefined})}>
            {children}
        </div>
    );
}
