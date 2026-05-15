import React from 'react';
import cn from 'bem-cn-lite';

import {
    selectNavigationCheckPermissionsError,
    selectNavigationIsAccountUsable,
    selectNavigationIsWritable,
    selectNavigationPathAccount,
} from '../../../store/selectors/navigation/navigation';
import {useSelector} from '../../../store/redux-hooks';
import {YTErrorBlock} from '../../../components/Block/Block';
import {selectPath} from '../../../store/selectors/navigation';
import {genAccountsAclLink} from '../../../utils/accounts/accounts';
import {selectCluster} from '../../../store/selectors/global';
import Link from '../../../components/Link/Link';

import './NavigationPermissionsNotice.scss';
const block = cn('navigation-permissions-notice');

export function NavigationPermissionsNotice() {
    const path = useSelector(selectPath);
    const isWriteable = useSelector(selectNavigationIsWritable);
    const isAccountUsable = useSelector(selectNavigationIsAccountUsable);
    const checkPermissionsError = useSelector(selectNavigationCheckPermissionsError);
    const account = useSelector(selectNavigationPathAccount);
    const cluster = useSelector(selectCluster);

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
