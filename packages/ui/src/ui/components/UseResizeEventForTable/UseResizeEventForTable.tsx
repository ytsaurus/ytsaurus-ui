import React from 'react';

export function useResizeEventForTable({
    length,
    timeout = 300,
}: {
    length?: number;
    timeout?: number;
}) {
    React.useEffect(() => {
        if (length !== undefined && length > 0) {
            setTimeout(
                () =>
                    requestAnimationFrame(() => {
                        window.dispatchEvent(new Event('resize'));
                    }),
                timeout,
            );
        }
    }, [length, timeout]);
}

export function UseResizeEventForTable({length, timeout}: {length?: number; timeout?: number}) {
    useResizeEventForTable({length, timeout});
    return null;
}
