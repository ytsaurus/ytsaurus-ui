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
            const {top} = element.getBoundingClientRect();
            const nextScrollMargin = Math.round(top + window.scrollY);

            setScrollMargin((currentScrollMargin) =>
                currentScrollMargin === nextScrollMargin ? currentScrollMargin : nextScrollMargin,
            );
        };

        updateScrollMargin();

        const intervalId = setInterval(updateScrollMargin, timeout);

        return () => {
            clearInterval(intervalId);
        };
    }, [element, timeout]);

    return scrollMargin;
}
