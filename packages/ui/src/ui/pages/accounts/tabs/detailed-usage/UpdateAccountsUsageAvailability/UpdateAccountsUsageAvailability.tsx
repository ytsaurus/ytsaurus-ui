import axios from 'axios';
import React from 'react';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../../../constants/accounts';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectCluster} from '../../../../../store/selectors/global/cluster';
import {selectIsAdmin} from '../../../../../store/selectors/global/is-developer';
import {updateUiConfigModeCookie} from '../../../../../utils/cookies/ui-config-mode';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import i18n from './i18n';

export function UpdateAccountsUsageAvailability() {
    const dispatch = useDispatch();
    const isAdmin = useSelector(selectIsAdmin);
    const cluster = useSelector(selectCluster);

    React.useEffect(() => {
        updateUiConfigModeCookie(isAdmin);
        wrapApiPromiseByToaster(
            axios
                .get<{
                    is_accounts_usage_available: boolean;
                }>(`/api/accounts-usage/${cluster}/check-available`)
                .then(({data: {is_accounts_usage_available}}) => {
                    dispatch({
                        type: ACCOUNTS_DATA_FIELDS_ACTION,
                        data: {is_accounts_usage_available},
                    });
                }),
            {
                toasterName: 'update-accounts-usage-availability',
                skipSuccessToast: true,
                errorContent: i18n('fail-content'),
            },
        );
    }, [isAdmin, cluster, dispatch]);

    return null;
}
