import {useCallback} from 'react';
import isEqual_ from 'lodash/isEqual';
import {selectAccountsRequestParams} from '../../../store/selectors/accounts/request-params';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {fetchAccounts} from '../../../store/actions/accounts/accounts';
import {useUpdater} from '../../../hooks/use-updater';

export default function AccountsUpdater() {
    const dispatch = useDispatch();

    const params = useSelector(selectAccountsRequestParams, isEqual_);

    const update = useCallback(() => dispatch(fetchAccounts(params)), [dispatch, params]);

    useUpdater(update);

    return null;
}
