import React from 'react';

import Loader from '../components/Loader/Loader';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

export default function withLazyLoading<P>(
    Component: React.ComponentType<P>,
    fallback?: React.ReactNode,
) {
    return function WithSuspense(props: P & React.JSX.IntrinsicAttributes) {
        return (
            <ErrorBoundary>
                <React.Suspense fallback={fallback ?? <Loader visible centered size="l" />}>
                    <Component {...props} />
                </React.Suspense>
            </ErrorBoundary>
        );
    };
}
