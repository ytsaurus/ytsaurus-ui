import React from 'react';
import {useDispatch} from 'react-redux';
import {fetchAccounts} from '../../../store/actions/accounts/accounts';
import {ACCOUNTS_UPDATER_ID} from '../../../constants/accounts/accounts';
import Updater from '../../../utils/hammer/updater';

const updater = new Updater();

export default function AccountsUpdater() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        updater.add(ACCOUNTS_UPDATER_ID, () => dispatch(fetchAccounts()), 30 * 1000);
        return () => {
            updater.remove(ACCOUNTS_UPDATER_ID);
        };
    }, []);

    return null;
}
