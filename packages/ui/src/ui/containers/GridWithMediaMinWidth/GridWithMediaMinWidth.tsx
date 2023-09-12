import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import guid from '../../common/hammer/guid';
import {getGlobalAsideHeaderWidth} from '../../store/selectors/global';

import './GridWithMediaMinWidth.scss';

const block = cn('grid-with-media-min-width');

export type WithMediaMinWidthProps = {
    className?: string;
    itemMinWidth: number;
    itemMaxWidth?: number;
    gap?: number;
    children: React.ReactNode;
    maxWidth?: number;
};

export function GridWithMediaMinWidth({
    className,
    maxWidth = 2400,
    itemMinWidth,
    itemMaxWidth = itemMinWidth * 1.5,
    gap = 0,
    children,
}: WithMediaMinWidthProps) {
    const asideHeaderWidth = useSelector(getGlobalAsideHeaderWidth);

    const {inlineClassName, inlineStyle} = React.useMemo(() => {
        const id = block(guid());
        const pagePadding = 40 + asideHeaderWidth;
        let res = `.${id} {`;
        res += `\ngap: ${gap}px;`;
        let i = 1;
        while (++i) {
            const minWidth = gap * (i - 1) + itemMinWidth * i + pagePadding;
            res += `\n@media (min-width: ${minWidth}px) {`;
            res += `\n grid-template-columns: ${Array.from({length: i}, () => '1fr').join(' ')};`;
            res += `\n max-width: ${gap * (i - 1) + itemMaxWidth * i}px;`;
            res += `};`;
            if (minWidth >= maxWidth) {
                break;
            }
        }
        res += `}`;
        return {inlineClassName: id, inlineStyle: res};
    }, [itemMinWidth, itemMaxWidth, maxWidth, gap, asideHeaderWidth]);

    return (
        <div className={block(null, [inlineClassName, className].filter(Boolean).join(' '))}>
            <style>{inlineStyle}</style>
            {children}
        </div>
    );
}
