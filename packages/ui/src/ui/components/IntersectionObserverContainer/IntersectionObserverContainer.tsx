import React from 'react';
import {useForkRef} from '@gravity-ui/uikit';

import {useIntersectionRatio} from '../../hooks/use-intersection';

type IntersectionObserverContainerProps = {
    className?: string;
    children: React.ReactNode;
};

/**
 * The container mount/unmount `props.children` when it has intersection with the view port.
 */
export const IntersectionObserverContainer = React.forwardRef(
    ({className, children}: IntersectionObserverContainerProps, ref: React.Ref<HTMLDivElement>) => {
        const [element, setElement] = React.useState<HTMLDivElement | null>(null);
        const intersectionRatio =
            useIntersectionRatio({
                element,
                options: {
                    threshold: [0, 1],
                },
            }) ?? 0;

        const setRef = useForkRef(setElement, ref);

        return (
            <div ref={setRef} className={className}>
                {intersectionRatio > 0 ? children : null}
            </div>
        );
    },
);

IntersectionObserverContainer.displayName = 'IntersectionObserverContainer';
