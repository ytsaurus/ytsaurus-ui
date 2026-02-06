import axios from 'axios';
import React from 'react';
import {NAVIGATION_PARTIAL} from '../../../../../constants/navigation';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {getCluster} from '../../../../../store/selectors/global/cluster';
import {isDeveloper} from '../../../../../store/selectors/global/is-developer';
import {updateUiConfigModeCookie} from '../../../../../utils/cookies/ui-config-mode';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import i18n from './i18n';

export function UpdateAccessLogAvailability() {
    const dispatch = useDispatch();
    const isAdmin = useSelector(isDeveloper);
    const cluster = useSelector(getCluster);

    React.useEffect(() => {
        updateUiConfigModeCookie(isAdmin);
        wrapApiPromiseByToaster(
            axios
                .get<{
                    is_access_log_available: boolean;
                }>(`/api/access-log/${cluster}/check-available`)
                .then(({data: {is_access_log_available}}) => {
                    dispatch({type: NAVIGATION_PARTIAL, data: {is_access_log_available}});
                }),
            {
                toasterName: 'update-access-log-availability',
                skipSuccessToast: true,
                errorContent: i18n('fail-content'),
            },
        );
    }, [isAdmin, dispatch]);

    return null;
}
