import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {Provider} from 'react-redux';
import cn from 'bem-cn-lite';
import {useSelector} from '../../store/redux-hooks';
import ErrorBoundary from '../../containers/ErrorBoundary/ErrorBoundary';
import {getWindowStore} from '../../store/window-store';
import {selectTheme} from '../../store/selectors/global';
import './AppStoreProvider.scss';

const block = cn('yt-app-store-provider');

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
    const theme = useSelector(selectTheme);
    return (
        <ThemeProvider theme={theme} rootClassName={block()}>
            {children}
        </ThemeProvider>
    );
}
