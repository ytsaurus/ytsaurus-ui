import {createSelector} from '@reduxjs/toolkit';
import {DashKitProps} from '@gravity-ui/dashkit';

import find_ from 'lodash/find';
import remove_ from 'lodash/remove';

import {RootState} from '../../../store/reducers';
import {accountsApi} from '../../../store/api/accounts';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';
import {getCluster} from '../../../store/selectors/global';

import {dashboardConfig} from '../../../constants/dashboard2';

import {makeDashboardConfigSettingName} from '../../../utils/dashboard/makeDashboardConfigSettingName';

export const getUsableAccountsResult = (state: RootState) => {
    const selector = accountsApi.endpoints.usableAccounts.select(undefined);
    return selector(state)?.data;
};

export const getDashboardConfig = createSelector(
    [getSettingsData, getCluster, getUsableAccountsResult],
    (data, cluster, usableAccounts) => {
        const settingName = makeDashboardConfigSettingName(cluster);
        // if user setuped his dashboard on current cluster no need to retrun default values
        if (data[settingName]?.items?.length) {
            return data[settingName];
        }

        const prevItems = [...dashboardConfig.items.slice(0, 4)];

        // we always have account item in default config(its a constant)
        const accountsItem = find_(prevItems, (item) => item.type === 'accounts')!;
        const newItem = {
            ...accountsItem,
            data: {
                ...accountsItem?.data,
                accounts: usableAccounts,
            },
        };

        remove_(prevItems, (item) => item.type === 'accounts');

        const config: DashKitProps['config'] = {
            ...dashboardConfig,
            items: [...prevItems, newItem],
        };

        return config;
    },
);

export const getSettingNewDashboardPage = (state: RootState) =>
    getSettingsData(state)['global::autoRefresh'];
