import * as React from 'react';
import {StrictReactNode} from '../QueryResultsView/YQLTable/utils';

interface FreezeProps {
    freeze: boolean;
    children: StrictReactNode;
    placeholder?: StrictReactNode;
}
export function Freeze({freeze, children, placeholder = null}: FreezeProps) {
    return (
        <React.Suspense fallback={placeholder}>
            <Suspender freeze={freeze}>{children}</Suspender>
        </React.Suspense>
    );
}

interface StorageRef {
    promise?: Promise<void>;
    resolve?: (value: void | PromiseLike<void>) => void;
}

interface SuspenderProps {
    freeze: boolean;
    children: StrictReactNode;
}
function Suspender({freeze, children}: SuspenderProps) {
    const promiseCache = React.useRef<StorageRef>({});
    if (freeze && !promiseCache.current.promise) {
        promiseCache.current.promise = new Promise((resolve) => {
            promiseCache.current.resolve = resolve;
        });
        throw promiseCache.current.promise;
    }
    if (freeze) {
        throw promiseCache.current.promise;
    }
    if (promiseCache.current.promise) {
        promiseCache.current.resolve?.();
        promiseCache.current.promise = undefined;
    }

    return <React.Fragment>{children}</React.Fragment>;
}
