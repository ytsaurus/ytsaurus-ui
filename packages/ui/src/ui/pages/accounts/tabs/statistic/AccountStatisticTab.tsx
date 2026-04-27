import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';

import AccountsNoContent from '../../../../pages/accounts/AccountsNoContent';
import {selectCluster, selectTheme} from '../../../../store/selectors/global';
import {
    selectActiveAccount,
    selectActiveAccountSubtreeNames,
} from '../../../../store/selectors/accounts/accounts';
import UIFactory from '../../../../UIFactory';
import i18n from './i18n';

function AccountStatisticTab() {
    const cluster = useSelector(selectCluster);
    const account = useSelector(selectActiveAccount);
    const accountSubtreeAllNames = useSelector(selectActiveAccountSubtreeNames);
    const theme = useSelector(selectTheme);

    if (!account) {
        return <AccountsNoContent hint={i18n('context_choose-account')} />;
    }

    const AccountStatisticsComponent = UIFactory.getStatisticsComponentForAccount()!;

    return (
        <div className={'elements-section'}>
            <AccountStatisticsComponent {...{cluster, account, accountSubtreeAllNames, theme}} />
        </div>
    );
}

export default React.memo(AccountStatisticTab);
