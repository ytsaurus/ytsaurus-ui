import React from 'react';

import {ThemeProvider} from '@gravity-ui/uikit';

import {Provider} from 'react-redux';
import {useSelector} from '../../store/redux-hooks';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import {getWindowStore} from '../../store/window-store';
import {getTheme} from '../../store/selectors/global';

export function AppStoreProvider({children}: {children: React.ReactNode}) {
    return (
        <Provider store={getWindowStore()}>
            <AppThemeProvider>
                <ErrorBoundary>{children}</ErrorBoundary>
            </AppThemeProvider>
        </Provider>
    );
}

export function AppThemeProvider({children}: {children: React.ReactNode}) {
    const theme = useSelector(getTheme);
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
