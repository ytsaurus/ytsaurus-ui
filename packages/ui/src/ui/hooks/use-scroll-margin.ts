import React from 'react';

export function useScrollMargin({
    element,
    timeout = 1000,
}: {
    element: Element | undefined | null;
    timeout?: number;
}) {
    const [scrollMargin, setScrollMargin] = React.useState<number>();

    React.useLayoutEffect(() => {
        if (!element) {
            return undefined;
        }

        const updateScrollMargin = () => {
            const elementTop = element.getBoundingClientRect().top;

            setScrollMargin(elementTop + window.scrollY);
        };

        updateScrollMargin();

        const intervalId = setInterval(updateScrollMargin, timeout);

        return () => {
            clearInterval(intervalId);
        };
    }, [element, timeout]);

    return scrollMargin;
}
