import React from 'react';

import {selectActiveAccount} from '../../../store/selectors/accounts/accounts';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {type AccountQuotaParams, setAccountQuota} from '../../../store/actions/accounts/editor-ts';
import {
    selectAccountsTree,
    selectEditableAccountQuotaSources,
} from '../../../store/selectors/accounts/accounts-ts';

import './AccountQuota.scss';

import {AccountQuotaEditor, type Props} from './AccountQuotaEditor';

function AccountQuota(props: Props) {
    const dispatch = useDispatch();
    const activeAccount = useSelector(selectActiveAccount);
    const accountsTree = useSelector(selectAccountsTree);

    const handleSetQuota = React.useCallback(
        (params: AccountQuotaParams) => {
            dispatch(setAccountQuota(params));
        },
        [dispatch],
    );

    const sources = useSelector(selectEditableAccountQuotaSources);

    return (
        <AccountQuotaEditor
            {...props}
            activeAccount={activeAccount}
            accountsTree={accountsTree}
            setAccountQuota={handleSetQuota}
            sources={sources}
        />
    );
}

const AccountQuotaMemo = React.memo(AccountQuota);

export default AccountQuotaMemo;
