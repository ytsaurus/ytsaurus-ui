import React from 'react';
import cn from 'bem-cn-lite';

import {
    getNavigationCheckPermissionsError,
    getNavigationIsAccountUsable,
    getNavigationIsWritable,
    getNavigationPathAccount,
} from '../../../store/selectors/navigation/navigation';
import {useSelector} from 'react-redux';
import {YTErrorBlock} from '../../../components/Block/Block';
import {getPath} from '../../../store/selectors/navigation';
import {genAccountsAclLink} from '../../../utils/accounts/accounts';
import {getCluster} from '../../../store/selectors/global';
import Link from '../../../components/Link/Link';

import './NavigationPermissionsNotice.scss';
const block = cn('navigation-permissions-notice');

export function NavigationPermissionsNotice() {
    const path = useSelector(getPath);
    const isWriteable = useSelector(getNavigationIsWritable);
    const isAccountUsable = useSelector(getNavigationIsAccountUsable);
    const checkPermissionsError = useSelector(getNavigationCheckPermissionsError);
    const account = useSelector(getNavigationPathAccount);
    const cluster = useSelector(getCluster);

    if (checkPermissionsError) {
        return <YTErrorBlock error={checkPermissionsError} message={'Check permissions error'} />;
    }

    const accountAclLink = genAccountsAclLink(cluster, account);

    return isWriteable && !isAccountUsable ? (
        <YTErrorBlock
            type={'alert'}
            message={
                <div className={block()}>
                    You cannot modify <span className={block('path')}> {path} </span> since you have
                    no permission <span className={block('use')}> use </span> to the corresponding
                    account
                    <Link routed url={accountAclLink}>
                        {' '}
                        {account}
                    </Link>
                    .
                </div>
            }
        />
    ) : null;
}
