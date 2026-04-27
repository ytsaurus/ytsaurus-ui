import React from 'react';
import block from 'bem-cn-lite';
import {type ConnectedProps, connect} from 'react-redux';
import {useSelector} from '../../../store/redux-hooks';

import reduce_ from 'lodash/reduce';

import {Redirect, Route, Switch} from 'react-router';

import {formatByParams} from '../../../../shared/utils/format';

import Tabs from '../../../components/Tabs/Tabs';

import {Page} from '../../../constants/index';
import {
    ACCOUNTS_ALLOWED_ROOT_TABS,
    ACCOUNTS_DEFAULT_TAB,
    AccountsTab,
} from '../../../constants/accounts/accounts';
import {
    selectAccountsIsFinalLoadingStatus,
    selectActiveAccount,
} from '../../../store/selectors/accounts/accounts-ts';
import {getLastVisitedTabs} from '../../../store/selectors/settings';
import {type TabSettings, makeTabProps} from '../../../utils';

import AccountsGeneralTab from '../tabs/general/AccountsGeneralTab';
import AccountStatisticTab from '../tabs/statistic/AccountStatisticTab';
import AccountsAclTab from '../tabs/acl/AccountsAclTab';
import AccountsMonitorTab from '../tabs/monitor/AccountsMonitorTab';
import AccountsUsageTab from '../tabs/detailed-usage/AccountUsageTab';
import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {useRumMeasureStop} from '../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {selectCluster} from '../../../store/selectors/global';
import AccountsUpdater from './AccountsUpdater';
import {type RootState} from '../../../store/reducers';

import './Accounts.scss';
import UIFactory from '../../../UIFactory';
import i18n from './i18n';
import {UI_TAB_SIZE} from '../../../constants/global';
import {UpdateAccountsUsageAvailability} from '../tabs/detailed-usage/UpdateAccountsUsageAvailability/UpdateAccountsUsageAvailability';

const b = block('accounts');

type Props = ConnectedProps<typeof connector>;

export class Accounts extends React.Component<
    Props & {match: {url: string; path: string}; lastVisitedTab: string}
> {
    static defaultProps = {
        lastVisitedTab: ACCOUNTS_DEFAULT_TAB,
    };

    render() {
        const {match, cluster, lastVisitedTab, activeAccount, allowUsageTab} = this.props;
        const showSettings = reduce_(
            AccountsTab,
            (acc, tab) => {
                acc[tab] = {
                    show: Boolean(activeAccount) || Boolean(ACCOUNTS_ALLOWED_ROOT_TABS[tab]),
                };
                return acc;
            },
            {} as Record<string, TabSettings>,
        );
        const usageTab = showSettings[AccountsTab.USAGE];
        usageTab.show = usageTab.show && Boolean(allowUsageTab);

        const statsTab = showSettings[AccountsTab.STATISTICS];
        statsTab.show = statsTab.show && Boolean(UIFactory.getStatisticsComponentForAccount());

        const {
            component: monitoringComponent,
            urlTemplate,
            title: monitoringTitle,
        } = UIFactory.getMonitoringForAccounts() ?? {};
        const monTab = showSettings[AccountsTab.MONITOR];
        monTab.show = monTab.show && Boolean(monitoringComponent ?? urlTemplate);
        if (urlTemplate) {
            monTab.routed = false;
            monTab.external = true;
            monTab.url = formatByParams(urlTemplate, {
                ytCluster: cluster,
                ytAccount: activeAccount,
            });
        }

        const props = makeTabProps(match.url, AccountsTab, showSettings, undefined, {
            [AccountsTab.GENERAL]: i18n('title_general'),
            [AccountsTab.STATISTICS]: i18n('title_statistics'),
            [AccountsTab.USAGE]: i18n('title_detailed-usage'),
            [AccountsTab.MONITOR]: monitoringTitle ?? i18n('title_monitoring'),
        });

        const lastTab = lastVisitedTab in AccountsTab ? lastVisitedTab : undefined;
        const tabToRedirect = activeAccount && lastTab ? lastTab : AccountsTab.GENERAL;

        return (
            <div className="elements-page__content">
                <UpdateAccountsUsageAvailability />
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
                                size={UI_TAB_SIZE}
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
                            {monTab.show && monitoringComponent && (
                                <Route
                                    path={`${match.path}/${AccountsTab.MONITOR}`}
                                    render={() => (
                                        <AccountsMonitorTab component={monitoringComponent} />
                                    )}
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

const mapStateToProps = (state: RootState) => {
    const lastVisitedTabs = getLastVisitedTabs(state);

    return {
        lastVisitedTab: lastVisitedTabs[Page.ACCOUNTS],
        activeAccount: selectActiveAccount(state),
        allowUsageTab: state.accounts.accounts.is_accounts_usage_available,
        cluster: selectCluster(state),
    };
};

const connector = connect(mapStateToProps);
export default connector(Accounts);

function AccountsRumMeasure() {
    const isFinalStatus = useSelector(selectAccountsIsFinalLoadingStatus);

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
