import React from 'react';

export default function withLazyLoading<P>(
    Component: React.ComponentType<P>,
    fallback?: React.ReactNode,
) {
    return function WithSuspense(props: P & React.JSX.IntrinsicAttributes) {
        return (
            <React.Suspense fallback={fallback}>
                <Component {...props} />
            </React.Suspense>
        );
    };
}
