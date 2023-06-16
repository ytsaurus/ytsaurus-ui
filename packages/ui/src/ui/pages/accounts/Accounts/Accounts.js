import React from 'react';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect, useSelector} from 'react-redux';
import _ from 'lodash';
import {Redirect, Route, Switch} from 'react-router';

import Tabs from '../../../components/Tabs/Tabs';

import {Page} from '../../../constants/index';
import {
    ACCOUNTS_ALLOWED_ROOT_TABS,
    ACCOUNTS_DEFAULT_TAB,
    AccountsTab,
} from '../../../constants/accounts/accounts';
import {
    getAccountsIsFinalLoadingStatus,
    getActiveAccount,
} from '../../../store/selectors/accounts/accounts-ts';
import {getLastVisitedTabs} from '../../../store/selectors/settings';
import {makeTabProps} from '../../../utils';

import AccountsGeneralTab from '../tabs/general/AccountsGeneralTab';
import AccountStatisticTab from '../tabs/statistic/AccountStatisticTab';
import AccountsAclTab from '../tabs/acl/AccountsAclTab';
import AccountsMonitorTab from '../tabs/monitor/AccountsMonitorTab';
import AccountsUsageTab from '../tabs/detailed-usage/AccountUsageTab';
import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {useRumMeasureStop} from '../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {getUISizes} from '../../../store/selectors/global';
import AccountsUpdater from './AccountsUpdater';
import {getAccountsUsageBasePath} from '../../../config';

import './Accounts.scss';
import UIFactory from '../../../UIFactory';

const b = block('accounts');

export class Accounts extends React.Component {
    static propTypes = {
        activeAccount: PropTypes.string.isRequired,
    };

    state = {
        editMode: false,
    };

    render() {
        const {match, lastVisitedTab, activeAccount, tabSize, allowUsageTab} = this.props;
        const showSettings = _.reduce(
            AccountsTab,
            (acc, tab) => {
                acc[tab] = {
                    show: Boolean(activeAccount) || Boolean(ACCOUNTS_ALLOWED_ROOT_TABS[tab]),
                };
                return acc;
            },
            {},
        );
        const usageTab = showSettings[AccountsTab.USAGE];
        usageTab.show = usageTab.show && Boolean(allowUsageTab);

        const statsTab = showSettings[AccountsTab.STATISTICS];
        statsTab.show = statsTab.show && Boolean(UIFactory.getStatisticsComponentForAccount());

        const monTab = showSettings[AccountsTab.MONITOR];
        monTab.show = monTab.show && Boolean(UIFactory.getMonitorComponentForAccount());

        const props = makeTabProps(match.url, AccountsTab, showSettings, undefined, {
            [AccountsTab.USAGE]: 'Detailed usage',
        });

        const lastTab = AccountsTab[lastVisitedTab] ? lastVisitedTab : undefined;
        const tabToRedirect = activeAccount && lastTab ? lastTab : AccountsTab.GENERAL;

        return (
            <div className="elements-page__content">
                <AccountsRumMeasure />
                <AccountsUpdater />
                <section className={b(null, 'elements-main-section')}>
                    <div className="elements-section">
                        <div className={b('heading')}>
                            <Tabs
                                {...props}
                                active={ACCOUNTS_DEFAULT_TAB}
                                className={b('tabs')}
                                routed
                                routedPreserveLocation
                                size={tabSize}
                            />
                        </div>
                    </div>
                    <div className={b('tab-viewer')}>
                        <Switch>
                            <Route
                                path={`${match.path}/${AccountsTab.GENERAL}`}
                                component={AccountsGeneralTab}
                            />
                            {statsTab.show && (
                                <Route
                                    path={`${match.path}/${AccountsTab.STATISTICS}`}
                                    component={AccountStatisticTab}
                                />
                            )}
                            {monTab.show && (
                                <Route
                                    path={`${match.path}/${AccountsTab.MONITOR}`}
                                    component={AccountsMonitorTab}
                                />
                            )}
                            <Route
                                path={`${match.path}/${AccountsTab.ACL}`}
                                component={AccountsAclTab}
                            />
                            {usageTab.show && (
                                <Route
                                    path={`${match.path}/${AccountsTab.USAGE}`}
                                    component={AccountsUsageTab}
                                />
                            )}
                            <Redirect from={match.url} to={`${match.url}/${tabToRedirect}`} />
                        </Switch>
                    </div>
                </section>
            </div>
        );
    }
}

Accounts.propTypes = {
    // from react-router
    match: PropTypes.shape({
        path: PropTypes.string.isRequired,
    }).isRequired,
    // from connect
    lastVisitedTab: PropTypes.string,
};

Accounts.defaultProps = {
    lastVisitedTab: ACCOUNTS_DEFAULT_TAB,
};

const mapStateToProps = (state) => {
    const lastVisitedTabs = getLastVisitedTabs(state);

    return {
        lastVisitedTab: lastVisitedTabs[Page.ACCOUNTS],
        activeAccount: getActiveAccount(state),
        tabSize: getUISizes(state).tabSize,
        allowUsageTab: Boolean(getAccountsUsageBasePath()),
    };
};

export default connect(mapStateToProps)(Accounts);

function AccountsRumMeasure() {
    const isFinalStatus = useSelector(getAccountsIsFinalLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.ACCOUNTS,
        allowStart: ([isFinal]) => !isFinal,
        startDeps: [isFinalStatus],
    });

    useRumMeasureStop({
        type: RumMeasureTypes.ACCOUNTS,
        allowStop: ([isFinal]) => isFinal,
        stopDeps: [isFinalStatus],
    });

    return null;
}
