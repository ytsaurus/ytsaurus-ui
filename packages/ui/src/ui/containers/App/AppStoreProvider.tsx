import React from 'react';

import {Provider} from 'react-redux';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import {getWindowStore} from '../../store/window-store';

export function AppStoreProvider({children}: {children: React.ReactNode}) {
    return (
        <Provider store={getWindowStore()}>
            <ErrorBoundary>{children}</ErrorBoundary>
        </Provider>
    );
}
