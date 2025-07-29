import React from 'react';

import {useMemoizedIfEqual} from './use-memoized';

type RMI = `${number}${'px' | '%'}`;
type RootMargin =
    | `${RMI}`
    | `${RMI} ${RMI}`
    | `${RMI} ${RMI} ${RMI}`
    | `${RMI} ${RMI} ${RMI} ${RMI}`;

type UseIntersectionParams = {
    element: Element | null;
    options: {
        threshold: Array<number>;
        rootMargin?: RootMargin;
    };
    onIntersection?: ((entry: IntersectionObserverEntry) => void) | undefined;
};

export function useIntersection({element, options, onIntersection}: UseIntersectionParams) {
    const [optionsMemoized] = useMemoizedIfEqual(options);

    React.useEffect(() => {
        if (!element) {
            return () => {};
        }
        const observer = new IntersectionObserver((entries) => {
            onIntersection?.(entries[0]);
        }, optionsMemoized);
        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [element, optionsMemoized, onIntersection]);
}

export function useIntersectionEntry(params: Omit<UseIntersectionParams, 'onIntersection'>) {
    const [intersectionRatio, setIntersectionRatio] = React.useState<IntersectionObserverEntry>();
    useIntersection({...params, onIntersection: setIntersectionRatio});
    return intersectionRatio;
}
