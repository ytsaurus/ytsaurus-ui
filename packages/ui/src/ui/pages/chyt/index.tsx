import React from 'react';

import Loader from '../../components/Loader/Loader';

const ChytPageLazy = React.lazy(() => import('./ChytPage'));

const ChytPageTopRowLazy = React.lazy(() => import('./ChytPageTopRow'));

export function ChytPage() {
    return (
        <React.Suspense fallback={<Loader visible centered size="l" />}>
            <ChytPageLazy />
        </React.Suspense>
    );
}

export function ChytPageTopRow() {
    return (
        <React.Suspense fallback={null}>
            <ChytPageTopRowLazy />
        </React.Suspense>
    );
}
