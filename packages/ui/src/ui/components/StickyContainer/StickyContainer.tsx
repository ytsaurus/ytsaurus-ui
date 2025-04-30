import React, {CSSProperties} from 'react';
import cn from 'bem-cn-lite';
import {useIntersectionRatio} from '../../hooks/use-intersection';
import {HEADER_HEIGHT} from '../../constants';

import './StickyContainer.scss';

const block = cn('yt-sticky-container');

export type StickyContainerProps = {
    className?: string;
    topOffset?: number;
    children: (params: {sticky: boolean; topStickyClassName?: string}) => React.ReactNode;
    hideShadow?: boolean;
    sitkyPostion?: 'sticky' | 'fixed';
};

export function StickyContainer({
    className,
    topOffset = HEADER_HEIGHT,
    children,
    hideShadow,
    sitkyPostion,
}: StickyContainerProps) {
    const [element, setElement] = React.useState<HTMLDivElement | null>(null);

    const intersectionRatio = useIntersectionRatio({
        element,
        options: {
            threshold: [0, 1],
            rootMargin: `${-topOffset}px 0px 0px 0px`,
        },
    });

    const sticky = intersectionRatio !== 1;

    const style = {'--yt-sticky-container-top-offset': `${topOffset}px`} as CSSProperties;

    return (
        <div className={block(null, className)} style={style}>
            <div className={block('top')} ref={setElement} />
            {children({
                sticky,
                topStickyClassName: sticky
                    ? block('sticky', {shadow: !hideShadow, fixed: sitkyPostion === 'fixed'})
                    : undefined,
            })}
        </div>
    );
}
