import React from 'react';
import {useLocation} from 'react-router';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {fetchAccounts} from '../../../store/actions/accounts/accounts';
import {selectAccountsEditCounter} from '../../../store/selectors/accounts/accounts-ts';
import {isAccountsGeneralPath} from '../../../constants/accounts/accounts';
import {useUpdater} from '../../../hooks/use-updater';

type Props = {
    loadAllAccountDetails?: boolean;
};

export default function AccountsUpdater({loadAllAccountDetails = false}: Props) {
    const dispatch = useDispatch();
    const currentRequestRef = React.useRef('');

    const editCounter = useSelector(selectAccountsEditCounter);
    const {pathname} = useLocation();
    const isGeneralTab = isAccountsGeneralPath(pathname);
    const shouldLoadAllAccountDetails = loadAllAccountDetails || isGeneralTab;
    const requestKey = `${pathname}:${editCounter}`;
    currentRequestRef.current = requestKey;

    const update = React.useCallback(() => {
        if (!shouldLoadAllAccountDetails) {
            return Promise.resolve();
        }

        return dispatch(
            fetchAccounts({
                shouldFetchDetails: () => currentRequestRef.current === requestKey,
            }),
        );
        // editCounter restarts the updater after account mutations.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, editCounter, requestKey, shouldLoadAllAccountDetails]);

    useUpdater(update);

    return null;
}
