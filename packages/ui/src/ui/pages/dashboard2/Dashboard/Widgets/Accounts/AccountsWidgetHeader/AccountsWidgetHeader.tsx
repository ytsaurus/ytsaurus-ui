import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit/build/esm';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useAccountsWidget} from '../hooks/use-accounts-widget';

export function AccountsWidgetHeader(props: PluginWidgetProps) {
    const name = props?.data?.name as string | undefined;
    const {accounts, isLoading} = useAccountsWidget(props);
    return (
        <WidgetHeader
            title={name || 'Accounts'}
            count={accounts?.length}
            page={'ACCOUNTS'}
            isLoading={isLoading}
        />
    );
}
