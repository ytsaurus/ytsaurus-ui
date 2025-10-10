import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';

import AccountsNoContent from '../../../../pages/accounts/AccountsNoContent';
import {getCluster, getTheme} from '../../../../store/selectors/global';
import {
    getActiveAccount,
    getActiveAccountSubtreeNames,
} from '../../../../store/selectors/accounts/accounts';
import UIFactory from '../../../../UIFactory';

function AccountStatisticTab() {
    const cluster = useSelector(getCluster);
    const account = useSelector(getActiveAccount);
    const accountSubtreeAllNames = useSelector(getActiveAccountSubtreeNames);
    const theme = useSelector(getTheme);

    if (!account) {
        return <AccountsNoContent hint="Choose an account to build a forecast" />;
    }

    const AccountStatisticsComponent = UIFactory.getStatisticsComponentForAccount()!;

    return (
        <div className={'elements-section'}>
            <AccountStatisticsComponent {...{cluster, account, accountSubtreeAllNames, theme}} />
        </div>
    );
}

export default React.memo(AccountStatisticTab);
