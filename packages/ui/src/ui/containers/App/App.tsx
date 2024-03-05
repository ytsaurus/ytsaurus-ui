import React, {Component} from 'react';
import {Route, Switch} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';

import {ThemeProvider, useThemeType, useThemeValue} from '@gravity-ui/uikit';

import ModalErrors from '../../containers/ModalErrors/ModalErrors';
import AttributesModal from '../../components/AttributesModal/AttributesModal';
import ClustersMenu from '../ClustersMenu/ClustersMenu';
import ClusterPageWrapper from '../../containers/ClusterPageWrapper/ClusterPageWrapper';
import ActionModal from '../ActionModal/ActionModal';
import {ChangePasswordFormPage} from '../../components/Login/ChangePasswordFormPage/ChangePasswordFormPage';
import {LoginFormPage} from '../../components/Login/LoginFormPage/LoginFormPage';

import {getSettingTheme, shouldUseSafeColors} from '../../store/selectors/settings';

import {RumUiProvider} from '../../rum/RumUiContext';
import AppNavigation from '../AppNavigation/AppNavigation';
import RetryBatchModals from '../RetryBatchModal/RetryBatchModal';
import {ManageTokensModal} from '../ManageTokens';
import {loadAllowedExperimentalPages, setTheme} from '../../store/actions/global';
import {getAuthPagesEnabled, getGlobalShowLoginDialog} from '../../store/selectors/global';

import './App.scss';
import {getFontType} from '../../store/selectors/settings-ts';

interface AppProps {
    theme?: 'light' | 'dark' | 'system' | 'light-hc' | 'dark-hc';
    fontType?: string;
    a11y?: boolean;
}

class App extends Component<AppProps> {
    static propTypes = {
        theme: PropTypes.oneOf(['light', 'dark', 'system', 'light-hc', 'dark-hc']).isRequired,
        fontType: PropTypes.string,
        a11y: PropTypes.bool.isRequired,
    };

    componentDidMount() {
        const {theme, fontType} = this.props;
        document.body.classList.add(`theme-${theme}`);
        if (fontType) document.body.classList.add(`font-${fontType}`);
    }

    componentDidUpdate(prevProps: AppProps) {
        if (prevProps.theme !== this.props.theme) {
            document.body.classList.remove(`theme-${prevProps.theme}`);
            document.body.classList.add(`theme-${this.props.theme}`);
        }

        if (prevProps.fontType !== this.props.fontType) {
            document.body.classList.remove(`font-${prevProps.fontType}`);
            document.body.classList.add(`font-${this.props.fontType}`);
        }
    }

    render() {
        return (
            <AppNavigation>
                <LoadAllowedExperimentalUrls />
                <div className="elements-page">
                    <Route exact path="/" render={() => <ClustersMenu />} />
                    <Route path="/:cluster/" render={() => <ClusterPageWrapper />} />
                    <AttributesModal />
                    <ActionModal />
                    <ModalErrors />
                    <RetryBatchModals />
                    <ManageTokensModal />
                </div>
            </AppNavigation>
        );
    }
}

function LoadAllowedExperimentalUrls() {
    const dispatch = useDispatch();

    React.useMemo(() => {
        dispatch(loadAllowedExperimentalPages());
    }, [dispatch]);
    return null;
}

function AppWithRum() {
    const theme = useThemeValue() as AppProps['theme'];
    const themeType = useThemeType();
    const a11y = useSelector(shouldUseSafeColors);
    const showLogin = useSelector(getGlobalShowLoginDialog);
    const hasAuthPages = useSelector(getAuthPagesEnabled);
    const fontType = useSelector(getFontType);

    return showLogin ? (
        <Route render={() => <LoginFormPage theme={themeType} />} />
    ) : (
        <Switch>
            {hasAuthPages ? (
                <Route
                    path={`/:cluster/change-password`}
                    render={(props) => (
                        <ChangePasswordFormPage
                            theme={themeType}
                            cluster={props.match.params.cluster}
                        />
                    )}
                />
            ) : null}
            <Route render={() => <App theme={theme} a11y={a11y} fontType={fontType} />} />
        </Switch>
    );
}

function AppWithRumContext() {
    const {theme, systemLightTheme, systemDarkTheme} = useThemeProviderProperties();
    return (
        <RumUiProvider>
            <ThemeProvider
                theme={theme as any}
                systemLightTheme={systemLightTheme}
                systemDarkTheme={systemDarkTheme}
            >
                <ThemeUpdater />
                <AppWithRum />
            </ThemeProvider>
        </RumUiProvider>
    );
}

export default React.memo(AppWithRumContext);

function ThemeUpdater() {
    const dispatch = useDispatch();
    const theme = useThemeValue() as AppProps['theme'];
    React.useEffect(() => {
        dispatch(setTheme(theme!));
    }, [theme, dispatch]);

    return null;
}

function useThemeProviderProperties() {
    const selectedTheme = useSelector(getSettingTheme);
    const useContrastTheme: boolean = useSelector(shouldUseSafeColors);
    const systemLightTheme = useContrastTheme ? 'light-hc' : 'light';
    const systemDarkTheme = useContrastTheme ? 'dark-hc' : 'dark';
    let theme: AppProps['theme'] = selectedTheme;
    if ((theme === 'dark' || theme === 'light') && useContrastTheme) theme = `${theme}-hc`;
    return {
        theme,
        systemLightTheme,
        systemDarkTheme,
    };
}
