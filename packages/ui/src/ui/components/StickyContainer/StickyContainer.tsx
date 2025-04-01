import React from 'react';
import cn from 'bem-cn-lite';
import {HEADER_HEIGHT} from '../../constants';
import {useIntersectionRatio} from '../../hooks/use-intersection';

import './StickyContainer.scss';

const block = cn('yt-sticky-container');

export function StickyContainer({
    topOffset = HEADER_HEIGHT,
    children,
}: {
    topOffset?: number;
    children: (params: {sticky: boolean; topStickyClassName?: string}) => React.ReactNode;
}) {
    const [element, setElement] = React.useState<HTMLDivElement | null>(null);

    const intersectionRatio = useIntersectionRatio({
        element,
        options: {
            threshold: [0, 1],
            rootMargin: `${-topOffset}px 0px 0px 0px`,
        },
    });

    const sticky = intersectionRatio !== 1;

    return (
        <div className={block()}>
            <div className={block('top')} ref={setElement} />
            {children({
                sticky,
                topStickyClassName: sticky ? block('sticky', {top: true}) : undefined,
            })}
        </div>
    );
}
