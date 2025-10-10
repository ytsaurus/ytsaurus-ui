import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {fetchAccounts} from '../../../store/actions/accounts/accounts';
import {getAccountsEditCounter} from '../../../store/selectors/accounts/accounts-ts';
import {useUpdater} from '../../../hooks/use-updater';

export default function AccountsUpdater() {
    const dispatch = useDispatch();

    const editCounter = useSelector(getAccountsEditCounter);

    const update = React.useCallback(() => {
        dispatch(fetchAccounts());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, editCounter]);

    useUpdater(update);

    return null;
}
