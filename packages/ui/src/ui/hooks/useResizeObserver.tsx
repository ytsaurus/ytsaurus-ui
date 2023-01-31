import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

interface Props {
    element?: Element;
    onResize: ResizeObserverCallback;
}

export default function useResizeObserver({element, onResize}: Props) {
    React.useEffect(() => {
        if (element) {
            const observer = new ResizeObserver(onResize);
            observer.observe(element);
            return () => {
                if (element) {
                    observer.unobserve(element);
                }
            };
        } else {
            return undefined;
        }
    }, [element, onResize]);
}
