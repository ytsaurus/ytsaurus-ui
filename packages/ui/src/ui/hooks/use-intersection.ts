import React from 'react';

import {useMemoizedIfEqual} from './use-updater';

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
    onIntersection?: ((intersectionRatio: number) => void) | undefined;
};

export function useIntersection({element, options, onIntersection}: UseIntersectionParams) {
    const [optionsMemoized] = useMemoizedIfEqual(options);

    React.useEffect(() => {
        if (!element) {
            return () => {};
        }
        const observer = new IntersectionObserver((entries) => {
            const value = entries[0].intersectionRatio;
            onIntersection?.(value);
        }, optionsMemoized);
        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [element, optionsMemoized, onIntersection]);
}

export function useIntersectionRatio(params: Omit<UseIntersectionParams, 'onIntersection'>) {
    const [intersectionRatio, setIntersectionRatio] = React.useState<number>();
    useIntersection({...params, onIntersection: setIntersectionRatio});
    return intersectionRatio;
}
