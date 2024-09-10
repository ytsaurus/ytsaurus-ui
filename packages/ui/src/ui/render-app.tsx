import './appearance';
import './redefinitions';
import './common/hammer';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {Router} from 'react-router';

import {createMainEntryStore} from './store/store.main';

import App from './containers/App/App';

import {configure} from '@gravity-ui/uikit';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import './legacy-styles/legacy.scss';
import './styles/redefinitions/redefinitions.scss';
import UIFactory, {UIFactory as UIFactoryType, configureUIFactory} from './UIFactory';

configure({lang: 'en'});

function AppRoot({store, history}: ReturnType<typeof createMainEntryStore>) {
    return (
        <Provider store={store}>
            <Router history={history}>{UIFactory.wrapApp(<App />)}</Router>
        </Provider>
    );
}

export function renderApp(overrides: UIFactoryType) {
    configureUIFactory(overrides);
    const {store, history} = createMainEntryStore();

    const root = createRoot(document.getElementById('root')!);
    root.render(<AppRoot {...{store, history}} />);
}
