import React from 'react';

export function useScrollMargin({
    element,
    timeout = 1000,
}: {
    element: Element | undefined | null;
    timeout?: number;
}) {
    const [scrollMargin, setScrollMargin] = React.useState<number>();

    React.useEffect(() => {
        if (!element) {
            return undefined;
        }

        const id = setInterval(() => {
            const {y: bodyY} = document.body.getBoundingClientRect();
            const {y} = element.getBoundingClientRect();

            const diff = Math.round(y - bodyY);

            if (scrollMargin !== diff) {
                setScrollMargin(diff);
            }
        }, timeout);

        return () => clearInterval(id);
    }, [scrollMargin, element, timeout]);

    return scrollMargin;
}
