import React from 'react';
import {useSelector} from 'react-redux';

import AccountsNoContent from '../../AccountsNoContent';

import {getActiveAccount} from '../../../../store/selectors/accounts/accounts';
import {getCluster} from '../../../../store/selectors/global';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';

function AccountsMonitorTab(props: {
    component: React.ComponentType<{cluster: string; account: string}>;
}) {
    const {component: AccountMonitor} = props;
    const account = useSelector(getActiveAccount);
    const cluster = useSelector(getCluster);

    if (!account) {
        return <AccountsNoContent hint={'Please choose one to display charts'} />;
    }

    return (
        <ErrorBoundary>
            <AccountMonitor {...{account, cluster}} />
        </ErrorBoundary>
    );
}

export default React.memo(AccountsMonitorTab);
