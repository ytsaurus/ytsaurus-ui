import React from 'react';
import {useMemoizedIfEqualWithChanges} from '../../hooks';

/**
 * TODO: get rid of the hook when https://github.com/gravity-ui/chartkit/issues/600 is fixed
 * @param data
 * @returns
 */
export function useMemoizedArgsWithIncarnaction<T extends Array<unknown>>(...args: T) {
    const incarnation = React.useRef(0);

    const {memoizedArgs, changed} = useMemoizedIfEqualWithChanges(...args);

    if (changed.some(Boolean)) {
        ++incarnation.current;
    }

    return {memoizedArgs, incarnation: incarnation.current};
}
