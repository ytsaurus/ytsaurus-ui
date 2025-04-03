import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import debounce_ from 'lodash/debounce';

interface Props {
    element?: Element;
    onResize: ResizeObserverCallback;
    debounceMs?: number;
}

export default function useResizeObserver({element, onResize, debounceMs = 300}: Props) {
    const handleResize = React.useMemo(() => {
        const onResizeDebounced = debounce_(onResize, debounceMs);
        return (...args: Parameters<typeof onResizeDebounced>) => {
            onResizeDebounced(...args);
        };
    }, [onResize, debounceMs]);

    React.useEffect(() => {
        if (element) {
            const observer = new ResizeObserver(handleResize);
            observer.observe(element);
            return () => {
                if (element) {
                    observer.unobserve(element);
                }
            };
        } else {
            return undefined;
        }
    }, [element, handleResize]);
}

export function useElementSize({
    element,
    debounceMs,
}: Pick<Props, 'element'> & {debounceMs?: number}) {
    const [entries, setEntries] = React.useState<Array<ResizeObserverEntry>>();

    useResizeObserver({element, onResize: setEntries, debounceMs});

    return entries?.[0];
}
