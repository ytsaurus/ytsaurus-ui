import {ytSetLang} from './i18n';
import './appearance';
import './common/hammer';

import React, {Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {useSelector} from './store/redux-hooks';

import {Router} from 'react-router';

import {selectSettingsData} from './store/selectors/settings/settings-base';
import {createMainEntryStore} from './store/store.main';

import App from './containers/App/App';
import {getConfigData} from './config/ui-settings';
import {toaster} from './utils/toaster';
import {showErrorPopup} from './utils/utils';
import i18n from './utils/i18n';

import '@gravity-ui/uikit/styles/styles.css';

import '@gravity-ui/unipika/styles/unipika.scss';

import './legacy-styles/legacy.scss';
import './styles/redefinitions/redefinitions.scss';

import {ErrorYsonSettingsProvider} from './containers/ErrorYsonSettingsProvider/ErrorYsonSettingsProvider';

import UIFactory, {type UIFactory as UIFactoryType, configureUIFactory} from './UIFactory';

function AppWithStore({store, history}: ReturnType<typeof createMainEntryStore>) {
    React.useEffect(() => {
        const errors = getConfigData().configurationErrors;
        if (!errors?.length) return;

        const error = {message: i18n('alert_configuration-error'), inner_errors: errors};
        toaster.add({
            name: 'configuration-errors',
            theme: 'danger',
            title: error.message,
            autoHiding: false,
            actions: [{label: i18n('action_details'), onClick: () => showErrorPopup(error)}],
        });
    }, []);

    return (
        <Provider store={store}>
            <AppRoot history={history} />
        </Provider>
    );
}

function AppRoot({history}: Pick<ReturnType<typeof createMainEntryStore>, 'history'>) {
    const lang = useSelector(selectSettingsData)['global::lang'] ?? 'en';

    React.useMemo(() => {
        ytSetLang(lang);
    }, [lang]);

    return (
        <ErrorYsonSettingsProvider key={lang}>
            <Suspense fallback={null}>
                <Router history={history}>{UIFactory.wrapApp(<App />)}</Router>
            </Suspense>
        </ErrorYsonSettingsProvider>
    );
}

export function renderApp(overrides: UIFactoryType) {
    configureUIFactory(overrides);
    const {store, history} = createMainEntryStore();

    const root = createRoot(document.getElementById('root')!);
    root.render(<AppWithStore {...{store, history}} />);
}
