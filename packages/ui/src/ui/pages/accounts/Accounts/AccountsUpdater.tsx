import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {fetchAccounts} from '../../../store/actions/accounts/accounts';
import {selectAccountsEditCounter} from '../../../store/selectors/accounts/accounts-ts';
import {useUpdater} from '../../../hooks/use-updater';

export default function AccountsUpdater() {
    const dispatch = useDispatch();

    const editCounter = useSelector(selectAccountsEditCounter);

    const update = React.useCallback(() => {
        return dispatch(fetchAccounts());
        // editCounter restarts the updater after account mutations.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, editCounter]);

    useUpdater(update);

    return null;
}
