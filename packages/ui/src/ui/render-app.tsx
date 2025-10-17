import {ytSetLang} from './i18n';
import './appearance';
import './common/hammer';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {useSelector} from './store/redux-hooks';

import {Router} from 'react-router';

import {getSettingsData} from './store/selectors/settings/settings-base';
import {createMainEntryStore} from './store/store.main';

import App from './containers/App/App';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import './legacy-styles/legacy.scss';
import './styles/redefinitions/redefinitions.scss';
import {ErrorYsonSettingsProvider} from './containers/ErrorYsonSettingsProvider/ErrorYsonSettingsProvider';

import UIFactory, {UIFactory as UIFactoryType, configureUIFactory} from './UIFactory';

function AppWithStore({store, history}: ReturnType<typeof createMainEntryStore>) {
    return (
        <Provider store={store}>
            <AppRoot history={history} />
        </Provider>
    );
}

function AppRoot({history}: Pick<ReturnType<typeof createMainEntryStore>, 'history'>) {
    const lang = useSelector(getSettingsData)['global::lang'] ?? 'en';

    React.useMemo(() => {
        ytSetLang(lang);
    }, [lang]);

    return (
        <ErrorYsonSettingsProvider key={lang}>
            <Router history={history}>{UIFactory.wrapApp(<App />)}</Router>
        </ErrorYsonSettingsProvider>
    );
}

export function renderApp(overrides: UIFactoryType) {
    configureUIFactory(overrides);
    const {store, history} = createMainEntryStore();

    const root = createRoot(document.getElementById('root')!);
    root.render(<AppWithStore {...{store, history}} />);
}
