import React from 'react';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useAccountsWidget} from '../hooks/use-accounts-widget';
import type {AccountsWidgetProps} from '../types';

export function AccountsWidgetHeader(props: AccountsWidgetProps) {
    const name = props?.data?.name;
    const {accounts, isLoading} = useAccountsWidget(props);
    return (
        <WidgetHeader
            title={name || 'Accounts'}
            count={accounts?.length}
            page={'ACCOUNTS'}
            isLoading={isLoading}
            id={props.id}
        />
    );
}
