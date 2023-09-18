import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import guid from '../../common/hammer/guid';
import {getGlobalAsideHeaderWidth} from '../../store/selectors/global';

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
        res += `\n display: grid;`;
        res += `\n gap: ${gap}px;`;
        res += `\n}`;
        let i = 1;
        function calcMinWidth(columnsCount: number) {
            return gap * (columnsCount - 1) + itemMinWidth * columnsCount + pagePadding;
        }
        while (++i) {
            const minWidth = calcMinWidth(i);
            const nextMinWidth = calcMinWidth(i + 1);
            const mediaMaxWidthCondition =
                minWidth >= maxWidth ? '' : `and (max-width: ${nextMinWidth}px)`;
            res += `\n@media screen and (min-width: ${minWidth}px) ${mediaMaxWidthCondition} {`;
            res += `\n .${id} {`;
            res += `\n   grid-template-columns: ${Array.from({length: i}, () => '1fr').join(' ')};`;
            res += `\n   max-width: ${gap * (i - 1) + itemMaxWidth * i}px;`;
            res += `\n }`;
            res += `\n}`;
            if (minWidth >= maxWidth) {
                break;
            }
        }
        return {inlineClassName: id, inlineStyle: res};
    }, [itemMinWidth, itemMaxWidth, maxWidth, gap, asideHeaderWidth]);

    return (
        <div className={block(null, [inlineClassName, className].filter(Boolean).join(' '))}>
            <style>{inlineStyle}</style>
            {children}
        </div>
    );
}
