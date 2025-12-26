import React, {CSSProperties} from 'react';
import cn from 'bem-cn-lite';
import {useIntersectionEntry} from '../../hooks/use-intersection';
import {HEADER_HEIGHT} from '../../constants';

import './StickyContainer.scss';

const block = cn('yt-sticky-container');

export type StickyContainerProps = {
    className?: string;
    topOffset?: number;
    children: (params: {stickyTop: boolean; stickyTopClassName?: string}) => React.ReactNode;
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

    const {intersectionRatio, boundingClientRect} =
        useIntersectionEntry({
            element,
            options: {
                threshold: [0, 1],
                rootMargin: `${-topOffset}px 0px 0px 0px`,
            },
        }) ?? {};

    const stickyTop = intersectionRatio !== 1 && boundingClientRect?.top! < topOffset;

    const style = React.useMemo(() => {
        return {'--yt-sticky-container-top-offset': `${topOffset}px`} as CSSProperties;
    }, [topOffset]);

    return (
        <div className={block(null, className)} style={style}>
            <div className={block('top')} ref={setElement} />
            {children({
                stickyTop,
                stickyTopClassName: stickyTop
                    ? block('sticky', {shadow: !hideShadow, fixed: sitkyPostion === 'fixed'})
                    : undefined,
            })}
        </div>
    );
}
