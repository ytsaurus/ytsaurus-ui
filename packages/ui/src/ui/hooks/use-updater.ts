import React from 'react';
import isEqual_ from 'lodash/isEqual';

import Updater from '../utils/hammer/updater';

export const DEFAULT_UPDATER_TIMEOUT = 30 * 1000;

const UPDATER_ID = 'UPDATER_ID';

export function useUpdater(
    fn?: () => unknown,
    {
        timeout = DEFAULT_UPDATER_TIMEOUT,
        destructFn,
    }: {timeout?: number; destructFn?: () => void} = {},
) {
    const [updater] = React.useState(fn ? new Updater() : undefined);
    React.useEffect(() => {
        if (fn) {
            updater?.add(UPDATER_ID, fn, timeout);
        }
        return () => {
            updater?.remove(UPDATER_ID);
            destructFn?.();
        };
    }, [updater, fn, timeout, destructFn]);
}

export function useUpdaterWithMemoizedParams<ArgsT extends Array<unknown>>(
    fn: undefined | ((...args: ArgsT) => unknown),
    timeout: number,
    ...args: ArgsT
) {
    const ref = React.useRef<ArgsT>(args);

    const params = React.useMemo(() => {
        if (!isEqual_(ref.current, args)) {
            ref.current = args;
        }
        return ref.current;
    }, [args]);

    const updateFn = React.useCallback(() => {
        fn?.(...params);
    }, [fn, params]);

    useUpdater(updateFn, {timeout});
}
