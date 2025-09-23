import React from 'react';

import {PrometheusDashboardLazy} from '../../../../../containers/PrometheusDashboard/lazy';

export function AccountsMonitorPrometheus({cluster, account}: {cluster: string; account: string}) {
    const params = React.useMemo(() => {
        return !cluster || !account
            ? undefined
            : {
                  cluster,
                  account,
              };
    }, [cluster, account]);

    return <PrometheusDashboardLazy type="master-accounts" params={params} />;
}
