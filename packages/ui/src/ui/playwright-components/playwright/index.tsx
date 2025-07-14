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

import {configureUIFactory} from '../../UIFactory';
import {appReducers} from '../../store/reducers/index.main';
import {rootApi} from '../../store/api';
import {defaultUIFactory} from '../../UIFactory/default-ui-factory';
import {AppThemeFont} from '../../containers/App/AppThemeFont';
import {registerPlugins} from '../../pages/dashboard2/Dashboard/utils/registerPlugins';

import '../../appearance';
import '../../common/hammer';

import '../../legacy-styles/legacy.scss';
import '../../styles/redefinitions/redefinitions.scss';
import '../../containers/App/App.scss';

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
                        {/* ignore theme prop error, applying theme inside mountFixture.tsx */}
                        {/* @ts-ignore */}
                        <AppThemeFont>
                            <App />
                        </AppThemeFont>
                    </ThemeProvider>
                </MemoryRouter>
            </Provider>
        </React.StrictMode>
    );
});
