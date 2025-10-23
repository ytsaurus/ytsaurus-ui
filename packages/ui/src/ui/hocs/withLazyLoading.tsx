import React from 'react';

import ErrorBoundary, {ErrorBoundaryProps} from '../components/ErrorBoundary/ErrorBoundary';
import Loader from '../components/Loader/Loader';

export default function withLazyLoading<P>(
    Component: React.ComponentType<P>,
    fallback?: React.ReactNode,
    errorBoundaryProps?: Pick<ErrorBoundaryProps, 'inline' | 'compact' | 'maxCompactMessageLength'>,
) {
    return function WithSuspense(props: P & React.JSX.IntrinsicAttributes) {
        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <React.Suspense fallback={fallback ?? <Loader visible centered size="l" />}>
                    <Component {...props} />
                </React.Suspense>
            </ErrorBoundary>
        );
    };
}
