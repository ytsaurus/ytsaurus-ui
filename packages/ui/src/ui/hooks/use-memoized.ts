import React from 'react';
import isEqual_ from 'lodash/isEqual';

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

export function useMemoizedIfEqualWithChanges<ArgsT extends Array<unknown>>(...args: ArgsT) {
    const ref = React.useRef(args);
    const memoizedArgs = useMemoizedIfEqual(...args);
    const res = {
        memoizedArgs,
        changed: ref.current.map((item, index) => {
            return item !== memoizedArgs[index];
        }),
    };
    ref.current = memoizedArgs;
    return res;
}
