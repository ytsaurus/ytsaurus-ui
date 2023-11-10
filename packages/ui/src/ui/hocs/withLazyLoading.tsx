import React from 'react';
import {Loader} from '@gravity-ui/uikit';

export default function withLazyLoading<P>(Component: React.ComponentType<P>) {
    return function WithSuspense(props: P & React.JSX.IntrinsicAttributes) {
        return (
            <React.Suspense fallback={<Loader />}>
                <Component {...props} />
            </React.Suspense>
        );
    };
}
