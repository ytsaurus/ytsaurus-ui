import React from 'react';
import {useSelector} from 'react-redux';
import sortBy_ from 'lodash/sortBy';
import map_ from 'lodash/map';
import uniq_ from 'lodash/uniq';

import {PrometheusDashboardLazy} from '../../../../../containers/PrometheusDashboard/lazy';
import {selectMediumList} from '../../../../../store/selectors/thor';
import {usePrometheusDashboardParams} from '../../../../../store/reducers/prometheusDashboard/prometheusDashboard-hooks';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {useAccountMonitoringAttribute} from '../useAccountMonitoringAttribute';

type LeftRightMedium = {
    left_medium?: string;
    right_medium?: string;
};

const ACCOUNTS_DASHBOARD_TYPE = 'master-accounts';

export function AccountsMonitorPrometheus({cluster, account}: {cluster: string; account: string}) {
    const {accountData, error, params} = useAccountMonitoringParams({
        cluster,
        account,
    });

    if (error) {
        return <YTErrorBlock error={error} />;
    }
    if (!accountData) {
        return null;
    }
    return <PrometheusDashboardLazy type={ACCOUNTS_DASHBOARD_TYPE} params={params} />;
}

function useAccountMonitoringParams({cluster, account}: {cluster: string; account: string}) {
    const mediumList: Array<string> = useSelector(selectMediumList);
    const {data: accountData, error} = useAccountMonitoringAttribute(
        cluster,
        account,
        'resource_limits/disk_space_per_medium',
    );

    const {params: selection, setParams: setSelection} =
        usePrometheusDashboardParams<LeftRightMedium>(ACCOUNTS_DASHBOARD_TYPE);

    React.useEffect(() => {
        if (!accountData) {
            return;
        }

        const mediumsDescBySize = sortBy_(
            map_(accountData, (v, k) => ({medium: k, limit: v})),
            'limit',
        ).filter(Boolean);

        let {left_medium, right_medium} = selection;
        if (-1 === mediumList.indexOf(left_medium!)) {
            left_medium = undefined;
        }

        if (-1 === mediumList.indexOf(right_medium!)) {
            right_medium = undefined;
        }

        const [left, right] = uniq_([
            ...mediumsDescBySize.map(({medium}) => medium),
            ...mediumList,
        ]);
        setSelection({
            left_medium: left_medium ?? left,
            right_medium: right_medium ?? right ?? left,
        });
    }, [accountData, selection, mediumList, setSelection]);

    const params = React.useMemo(() => {
        return !cluster || !account ? undefined : {cluster, account};
    }, [cluster, account]);

    const options = mediumList.map((value) => {
        return {value, text: value};
    });

    return {options, params, selection, setSelection, accountData, error};
}
