import {useCallback, useEffect, useRef, useState} from 'react';

export type RefCallback = (node: HTMLDivElement | null) => void;

export const usePrevious = <T>(value: T): T | undefined => {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

export const useNode = (onRefCallbackCall?: RefCallback) => {
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [element, setElement] = useState<HTMLDivElement | null>(null);

    const ref = useRef<HTMLDivElement | null>(null);

    const refCallback = useCallback<RefCallback>((node) => {
        onRefCallbackCall?.(node);

        if (node !== null) {
            setRect(node.getBoundingClientRect());
            setElement(node);

            ref.current = node;
        }
    }, []);

    return [{rect, element, ref}, refCallback] as const;
};
