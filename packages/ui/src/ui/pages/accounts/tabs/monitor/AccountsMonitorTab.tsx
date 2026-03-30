import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';

import AccountsNoContent from '../../AccountsNoContent';

import {getActiveAccount} from '../../../../store/selectors/accounts/accounts';
import {selectCluster} from '../../../../store/selectors/global';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';

import i18n from './i18n';

function AccountsMonitorTab(props: {
    component: React.ComponentType<{cluster: string; account: string}>;
}) {
    const {component: AccountMonitor} = props;
    const account = useSelector(getActiveAccount);
    const cluster = useSelector(selectCluster);

    if (!account) {
        return <AccountsNoContent hint={i18n('please-choose-one-to-display')} />;
    }

    return (
        <ErrorBoundary>
            <AccountMonitor {...{account, cluster}} />
        </ErrorBoundary>
    );
}

export default React.memo(AccountsMonitorTab);
