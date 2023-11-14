import React from 'react';
import isEqual_ from 'lodash/isEqual';

import Updater from '../utils/hammer/updater';

export const DEFAULT_UPDATER_TIMEOUT = 30 * 1000;

const UPDATER_ID = 'UPDATER_ID';

export type UseUpdaterOptions = {
    /**
     * polling interval
     */
    timeout?: number;
    /**
     * a callback that will be callad at destruction stage of React.useEffect(...)
     */
    destructFn?: () => void;
    /**
     * if `true` then `fn()` will be called only once
     */
    onlyOnce?: boolean;
};

export function useUpdater(
    fn?: () => unknown,
    {timeout = DEFAULT_UPDATER_TIMEOUT, destructFn, onlyOnce}: UseUpdaterOptions = {},
) {
    const [updater] = React.useState(fn ? new Updater() : undefined);
    React.useEffect(() => {
        if (fn) {
            if (onlyOnce) {
                fn();
            } else {
                updater?.add(UPDATER_ID, fn, timeout);
            }
        }
        return () => {
            updater?.remove(UPDATER_ID);
            destructFn?.();
        };
    }, [updater, fn, timeout, destructFn, onlyOnce]);
}

export function useUpdaterWithMemoizedParams<ArgsT extends Array<unknown>>(
    fn: undefined | ((...args: ArgsT) => unknown),
    options?: UseUpdaterOptions,
    ...args: ArgsT
) {
    const params = useMemoizedIfEqual(...args);

    const updateFn = React.useCallback(() => {
        fn?.(...params);
    }, [fn, params]);

    useUpdater(updateFn, options);
}

export function useMemoizedIfEqual<ArgsT extends Array<unknown>>(...args: ArgsT) {
    const ref = React.useRef<ArgsT>(args);

    const params = React.useMemo(() => {
        if (!isEqual_(ref.current, args)) {
            ref.current = args;
        }
        return ref.current;
    }, [args]);

    return params;
}
