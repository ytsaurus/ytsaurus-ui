import React from 'react';
import {useSelector} from 'react-redux';
import sortBy_ from 'lodash/sortBy';
import map_ from 'lodash/map';
import uniq_ from 'lodash/uniq';

import ypath from '../../../../../common/thor/ypath';

import {PrometheusDashboardLazy} from '../../../../../containers/PrometheusDashboard/lazy';
import {getAccountsMapByName} from '../../../../../store/selectors/accounts/accounts-ts';
import {getMediumList} from '../../../../../store/selectors/thor';
import {usePrometheusDashboardParams} from '../../../../../store/reducers/prometheusDashboard/prometheusDashboard-hooks';

type LeftRightMedium = {
    left_medium?: string;
    right_medium?: string;
};

const ACCOUNTS_DASHBOARD_TYPE = 'master-accounts';

export function AccountsMonitorPrometheus({cluster, account}: {cluster: string; account: string}) {
    const {accountData, params} = useAccountMonitoringParams({
        cluster,
        account,
    });

    return !accountData ? null : (
        <PrometheusDashboardLazy type={ACCOUNTS_DASHBOARD_TYPE} params={params} />
    );
}

function useAccountMonitoringParams({cluster, account}: {cluster: string; account: string}) {
    const mediumList: Array<string> = useSelector(getMediumList);
    const accountData = useSelector(getAccountsMapByName)[account];

    const {params: selection, setParams: setSelection} =
        usePrometheusDashboardParams<LeftRightMedium>(ACCOUNTS_DASHBOARD_TYPE);

    React.useEffect(() => {
        if (!accountData) {
            return;
        }

        const mediumsDescBySize = sortBy_(
            map_(
                ypath.getValue(accountData, '/@resource_limits/disk_space_per_medium') as Record<
                    string,
                    number
                >,
                (v, k) => {
                    return {medium: k, limit: v};
                },
            ),
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

    return {options, params, selection, setSelection, accountData};
}
