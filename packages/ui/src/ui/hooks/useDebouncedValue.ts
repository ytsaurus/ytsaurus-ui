import debounce_ from 'lodash/debounce';
import {useEffect, useRef, useState} from 'react';

type DebounceSettings = Parameters<typeof debounce_>[2];

/**
 * Returns a debounced copy of `value` that updates only after `delay` ms of inactivity.
 *
 * NB! Options `delay`, `leading`, `trailing`, `maxWait` are treated as static and must not change between renders.
 */
export const useDebouncedValue = <T>(value: T, delay: number, settings?: DebounceSettings): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    const debouncedSetRef = useRef(debounce_(setDebouncedValue, delay, settings));

    useEffect(() => {
        debouncedSetRef.current(value);
    }, [value]);

    useEffect(() => {
        const debouncedSet = debouncedSetRef.current;

        return () => {
            debouncedSet.cancel();
        };
    }, []);

    return debouncedValue;
};
