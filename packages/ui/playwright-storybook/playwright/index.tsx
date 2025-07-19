import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import {MemoryRouter} from 'react-router';
import {Provider} from 'react-redux';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {beforeMount} from '@playwright/experimental-ct-react/hooks';
import {ThemeProvider, configure} from '@gravity-ui/uikit';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {configureUIFactory} from '../../src/ui/UIFactory';
import {appReducers} from '../../src/ui/store/reducers/index.main';
import {rootApi} from '../../src/ui/store/api';
import {defaultUIFactory} from '../../src/ui/UIFactory/default-ui-factory';
import {AppThemeFont} from '../../src/ui/containers/App/AppThemeFont';
import {registerPlugins} from '../../src/ui/pages/dashboard2/Dashboard/utils/registerPlugins';

import '../../src/ui/appearance';
import '../../src/ui/common/hammer';

import '../../src/ui/legacy-styles/legacy.scss';
import '../../src/ui/styles/redefinitions/redefinitions.scss';
import '../../src/ui/containers/App/App.scss';

beforeMount(async ({App}) => {
    configure({lang: 'en'});
    configureUIFactory(defaultUIFactory);
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

    const store = configureStore({
        reducer: combineReducers(appReducers),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({serializableCheck: false}).concat(rootApi.middleware),
        devTools: process.env.NODE_ENV !== 'production',
    });
    registerPlugins();

    return (
        <React.StrictMode>
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']}>
                    <ThemeProvider>
                        <AppThemeFont>
                            <App />
                        </AppThemeFont>
                    </ThemeProvider>
                </MemoryRouter>
            </Provider>
        </React.StrictMode>
    );
});
