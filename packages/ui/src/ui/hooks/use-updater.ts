import React from 'react';
import {useSelector} from 'react-redux';
import isEqual_ from 'lodash/isEqual';

import {Updater} from '../utils/hammer/updater';
import {getUseAutoRefresh} from '../store/selectors/settings';
import {uiSettings} from '../config/ui-settings';

export const DEFAULT_UPDATER_TIMEOUT = 30 * 1000;

export type UseUpdaterOptions = {
    /**
     * polling interval
     */
    timeout?: number;
    /**
     * a callback that will be called at destruction stage of React.useEffect(...)
     */
    destructFn?: () => void;
    /**
     * if `true` then `fn()` will be called only once
     */
    onlyOnce?: boolean;
};

export function useUpdater(
    fn?: () => unknown,
    {
        timeout = uiSettings.useUpdaterTimeoutMs ?? DEFAULT_UPDATER_TIMEOUT,
        destructFn,
        onlyOnce,
    }: UseUpdaterOptions = {},
) {
    const useAutoRefresh = useSelector(getUseAutoRefresh) as boolean;
    const optionsRef = React.useRef({skipNextCall: !useAutoRefresh});

    optionsRef.current.skipNextCall = !useAutoRefresh;

    React.useEffect(() => {
        let updater: Updater | undefined;
        if (onlyOnce) {
            fn?.();
        } else {
            updater = fn
                ? new Updater(fn, timeout, {
                      getSkipNextCall() {
                          return optionsRef.current.skipNextCall;
                      },
                  })
                : undefined;
        }

        return () => {
            updater?.destroy();
            destructFn?.();
        };
    }, [fn, timeout, destructFn, onlyOnce]);
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
