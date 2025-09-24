import React from 'react';
import {useSelector} from 'react-redux';
import sortBy_ from 'lodash/sortBy';
import map_ from 'lodash/map';
import uniq_ from 'lodash/uniq';

import ypath from '../../../../../common/thor/ypath';

import {PrometheusDashboardLazy} from '../../../../../containers/PrometheusDashboard/lazy';
import Select from '../../../../../components/Select/Select';
import {Toolbar} from '../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {getAccountsMapByName} from '../../../../../store/selectors/accounts/accounts-ts';
import {getMediumList} from '../../../../../store/selectors/thor';

import i18n from '../i18n';

type LeftRightMedium = {
    left_medium?: string;
    right_medium?: string;
};

export function AccountsMonitorPrometheus({cluster, account}: {cluster: string; account: string}) {
    const mediumList: Array<string> = useSelector(getMediumList);
    const accountData = useSelector(getAccountsMapByName)[account];

    const [selection, setSelection] = React.useState<LeftRightMedium | undefined>();

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

        const [left_medium, right_medium] = uniq_([
            ...mediumsDescBySize.map(({medium}) => medium),
            ...mediumList,
        ]);
        setSelection({left_medium, right_medium});
    }, [accountData, mediumList]);

    const params = React.useMemo(() => {
        return !cluster || !account
            ? undefined
            : {
                  cluster,
                  account,
                  ...selection,
              };
    }, [cluster, account, selection]);

    const options = mediumList.map((value) => {
        return {value, text: value};
    });

    return !accountData ? null : (
        <>
            <Toolbar
                marginTopSkip
                itemsToWrap={[
                    {
                        node: (
                            <Select
                                value={
                                    selection?.left_medium !== undefined
                                        ? [selection.left_medium]
                                        : []
                                }
                                items={options}
                                label={i18n('left-medium') + ':'}
                                onUpdate={([left_medium]) => {
                                    setSelection((state) => {
                                        return {...state, left_medium};
                                    });
                                }}
                            />
                        ),
                        width: 300,
                    },
                    {
                        node: (
                            <Select
                                value={
                                    selection?.right_medium !== undefined
                                        ? [selection.right_medium]
                                        : []
                                }
                                items={options}
                                label={i18n('right-medium') + ':'}
                                onUpdate={([right_medium]) => {
                                    setSelection((state) => {
                                        return {...state, right_medium};
                                    });
                                }}
                            />
                        ),
                        width: 300,
                    },
                ]}
            />
            <PrometheusDashboardLazy type="master-accounts" params={params} />
        </>
    );
}
