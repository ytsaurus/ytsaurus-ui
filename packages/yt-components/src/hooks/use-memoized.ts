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
