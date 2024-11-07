import React from 'react';
import cn from 'bem-cn-lite';
import {HEADER_HEIGHT} from '../../constants';

import './StickyContainer.scss';

const block = cn('yt-sticky-container');

export function StickyContainer({
    topOffset = HEADER_HEIGHT,
    children,
}: {
    topOffset?: number;
    children: (params: {sticky: boolean; topStickyClassName?: string}) => React.ReactNode;
}) {
    const [sticky, setSticky] = React.useState(false);
    const [element, setElement] = React.useState<HTMLDivElement | null>(null);

    const observer = React.useMemo(() => {
        return new IntersectionObserver(
            (entries) => {
                if (entries[0].intersectionRatio === 0) {
                    setSticky(true);
                } else if (entries[0].intersectionRatio === 1) {
                    setSticky(false);
                }
            },
            {threshold: [0, 1], rootMargin: `${-topOffset ?? 0}px 0px 0px 0px`},
        );
    }, [topOffset]);

    React.useEffect(() => {
        if (element) {
            observer.observe(element);
        }
        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [element]);

    const onRef = React.useCallback((div: HTMLDivElement | null) => {
        setElement(div);
    }, []);

    return (
        <div className={block()}>
            <div className={block('top')} ref={onRef} />
            {children({
                sticky,
                topStickyClassName: sticky ? block('sticky', {top: true}) : undefined,
            })}
        </div>
    );
}
