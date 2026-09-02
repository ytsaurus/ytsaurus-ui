import React from 'react';
import {useLocation} from 'react-router';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {
    fetchAccountsList,
    fetchAccountsMetadata,
    fetchAccountsNodes,
    fetchAccountsTotals,
    fetchActiveAccount,
    fetchUsableAccounts,
    resetAccountsCacheIfCurrent,
} from '../../../store/actions/accounts/accounts';
import {
    selectAccountsEditCounter,
    selectActiveAccount,
} from '../../../store/selectors/accounts/accounts-ts';
import {AccountsTab} from '../../../constants/accounts/accounts';
import {useUpdater} from '../../../hooks/use-updater';

type Props = {
    loadAllAccountDetails?: boolean;
};

export default function AccountsUpdater({loadAllAccountDetails = false}: Props) {
    const dispatch = useDispatch();
    const currentRequestRef = React.useRef('');

    const editCounter = useSelector(selectAccountsEditCounter);
    const activeAccount = useSelector(selectActiveAccount);
    const {pathname} = useLocation();
    const isGeneralTab = pathname.endsWith('/' + AccountsTab.GENERAL);
    const shouldLoadAllAccountDetails = loadAllAccountDetails || isGeneralTab;
    const requestKey = `${pathname}:${activeAccount}:${editCounter}`;
    currentRequestRef.current = requestKey;

    const update = React.useCallback(() => {
        return dispatch(fetchAccountsList())
            .then((accounts) => {
                if (!accounts || currentRequestRef.current !== requestKey) {
                    return undefined;
                }
                if (!shouldLoadAllAccountDetails) {
                    dispatch(resetAccountsCacheIfCurrent(editCounter));
                    return undefined;
                }
                if (activeAccount) {
                    return dispatch(fetchActiveAccount(activeAccount)).then(() => {
                        dispatch(resetAccountsCacheIfCurrent(editCounter));
                    });
                }
                return Promise.all([
                    dispatch(fetchAccountsMetadata()),
                    dispatch(fetchAccountsTotals()),
                    dispatch(fetchAccountsNodes()),
                    dispatch(fetchUsableAccounts()),
                ]).then(() => {
                    dispatch(resetAccountsCacheIfCurrent(editCounter));
                });
            })
            .catch(() => undefined);
        // editCounter restarts the updater after account mutations.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAccount, dispatch, editCounter, requestKey, shouldLoadAllAccountDetails]);

    useUpdater(update);

    return null;
}
