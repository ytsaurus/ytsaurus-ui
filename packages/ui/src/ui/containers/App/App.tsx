import React from 'react';
import {Route, Switch} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';

import {ThemeProvider, useThemeType, useThemeValue} from '@gravity-ui/uikit';

import ModalErrors from '../../containers/ModalErrors/ModalErrors';
import AttributesModal from '../../components/AttributesModal/AttributesModal';
import {ClustersMenuLazy} from '../../containers/ClustersMenu/lazy';
import {ClusterPageWrapperLazy} from '../../containers/ClusterPageWrapper/lazy';
import ActionModal from '../ActionModal/ActionModal';
import {ChangePasswordFormPage} from '../../components/Login/ChangePasswordFormPage/ChangePasswordFormPage';
import {LoginFormPage} from '../../components/Login/LoginFormPage/LoginFormPage';

import {getSettingTheme, shouldUseSafeColors} from '../../store/selectors/settings';

import {RumUiProvider} from '../../rum/RumUiContext';
import AppNavigation from '../AppNavigation/AppNavigation';
import RetryBatchModals from '../RetryBatchModal/RetryBatchModal';
import {ManageTokensModal} from '../ManageTokens';
import {setTheme} from '../../store/actions/global';
import {loadAllowedExperimentalPages} from '../../store/actions/global/experimental-pages';
import {getAuthPagesEnabled, getGlobalShowLoginDialog} from '../../store/selectors/global';
import {getFontType} from '../../store/selectors/global/fonts';
import UIFactory from '../../UIFactory';

import {AppThemeFont, AppThemeFontProps} from './AppThemeFont';

import './App.scss';

function LoadAllowedExperimentalUrls() {
    const dispatch = useDispatch();

    React.useMemo(() => {
        dispatch(loadAllowedExperimentalPages());
    }, [dispatch]);
    return null;
}

function AppWithRum() {
    const theme = useThemeValue() as AppThemeFontProps['theme'];
    const themeType = useThemeType();
    const showLogin = useSelector(getGlobalShowLoginDialog);
    const hasAuthPages = useSelector(getAuthPagesEnabled);
    const fontType = useSelector(getFontType);

    const {footer, footerHeight} = UIFactory.renderAppFooter() ?? {};

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
            <Route
                render={() => (
                    <AppThemeFont theme={theme} fontType={fontType}>
                        <AppNavigation>
                            <LoadAllowedExperimentalUrls />
                            <div
                                className="elements-page"
                                style={
                                    {
                                        '--app-footer-height': `${footerHeight ?? 0}px`,
                                        minHeight:
                                            'calc(100vh - var(--app-header-height) - var(--app-footer-height))',
                                    } as React.CSSProperties
                                }
                            >
                                <Route exact path="/" render={() => <ClustersMenuLazy />} />
                                <Route
                                    path="/:cluster/"
                                    render={() => <ClusterPageWrapperLazy />}
                                />
                                <AttributesModal />
                                <ActionModal />
                                <ModalErrors />
                                <RetryBatchModals />
                                <ManageTokensModal />
                            </div>
                            {footer}
                        </AppNavigation>
                    </AppThemeFont>
                )}
            />
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
    const theme = useThemeValue() as AppThemeFontProps['theme'];
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
    let theme: AppThemeFontProps['theme'] = selectedTheme;
    if ((theme === 'dark' || theme === 'light') && useContrastTheme) theme = `${theme}-hc`;
    return {
        theme,
        systemLightTheme,
        systemDarkTheme,
    };
}
