import React from 'react';
import cn from 'bem-cn-lite';

import {useElementSize} from '../../hooks/useResizeObserver';

const block = cn('yt-resize-observer-container');

export function ResizeObserverContainer({
    className,
    observeContent,
    children,
}: {
    className?: string;
    observeContent: React.ReactNode;
    children: (size: {width?: number; height?: number}) => React.ReactNode;
}) {
    const [observeElement, setObserveElement] = React.useState<HTMLDivElement | null>(null);

    const size = useElementSize({element: observeElement});
    const {width, height} = size?.contentRect ?? {};

    return (
        <div className={block(null, className)}>
            <div className={block('observe')} ref={setObserveElement}>
                {observeContent}
            </div>
            {children({width, height})}
        </div>
    );
}
