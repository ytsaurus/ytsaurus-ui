import React from 'react';
import cn from 'bem-cn-lite';

const block = cn('yt-page-counter');

export interface PageCounterProps {
    className?: string;
    pageIndex?: number;
    pageCount?: number;
}

function PageCounter({pageIndex, pageCount, className}: PageCounterProps) {
    if (pageIndex === undefined || pageCount === undefined) {
        return null;
    }

    return pageCount! > 1 ? (
        <span className={block(null, className)}>
            Page: {(pageIndex || 0) + 1} / {pageCount}
        </span>
    ) : null;
}

export default React.memo(PageCounter);
