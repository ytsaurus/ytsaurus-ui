import React, {Fragment, type ReactNode} from 'react';

import {Secondary} from '@ytsaurus/components';

import {NoContent} from '../../../../../components/NoContent';
import {useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccountsUsageDiffFromSnapshot,
    selectAccountsUsageDiffToSnapshot,
    selectIsAccountsUsageDiffView,
} from '../../../../../store/selectors/accounts/account-usage';

import i18n from '../i18n';

type Props = {
    children: ReactNode;
};

const AccountUsageDetailsDiffImpl = ({children}: Props) => {
    const isDiffView = useSelector(selectIsAccountsUsageDiffView);
    const from = useSelector(selectAccountsUsageDiffFromSnapshot);
    const to = useSelector(selectAccountsUsageDiffToSnapshot);

    if (!isDiffView) {
        return <>{i18n('alert_unexpected-view-mode')}</>;
    }

    if ((!from && !to) || from === to) {
        return (
            <NoContent
                warning={i18n('alert_no-selected-snapshot-range')}
                hint={
                    <Fragment>
                        {i18n('context_select-snapshot-start')}{' '}
                        <Secondary>{i18n('action_snapshot-from')}</Secondary>,{' '}
                        <Secondary>{i18n('action_snapshot-to')}</Secondary>{' '}
                        {i18n('context_select-snapshot-end')}
                    </Fragment>
                }
            />
        );
    }

    return <>{children}</>;
};

export const AccountUsageDetailsDiff = React.memo(AccountUsageDetailsDiffImpl);
