import {createSelector} from '@reduxjs/toolkit';
import {DashKitProps} from '@gravity-ui/dashkit';

import find_ from 'lodash/find';
import remove_ from 'lodash/remove';

import {RootState} from '../../../store/reducers';
import {accountsApi} from '../../../store/api/accounts';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';
import {getCluster, getCurrentUserName} from '../../../store/selectors/global';

import {dashboardConfig} from '../../../constants/dashboard2';

export const getUsableAccountsResult = (state: RootState) => {
    const selector = accountsApi.endpoints.usableAccounts.select(undefined);
    return selector(state)?.data;
};

export const getDashboardConfig = createSelector(
    [getSettingsData, getCluster, getCurrentUserName],
    (data, cluster, username) => {
        // if user setuped his dashboard on current cluster no need to retrun default values
        if (
            data[`local::${cluster}::dashboard::config`] &&
            data[`local::${cluster}::dashboard::config`]?.salt !== dashboardConfig.salt
        ) {
            return data[`local::${cluster}::dashboard::config`];
        }

        const prevItems = [...dashboardConfig.items.slice(0, 4)];

        // we always have queries item in default config(its a constant)
        const queriesItem = find_(prevItems, (item) => item.type === 'queries')!;
        // new item cause of default username
        const newItem = {
            ...queriesItem,
            data: {
                ...queriesItem?.data,
                authors: [{value: username, type: 'users'}],
            },
        };

        remove_(prevItems, (item) => item.type === 'queries');

        const config: DashKitProps['config'] = {
            ...dashboardConfig,
            items: [...prevItems, newItem],
        };

        return config;
    },
);

export const getSettingNewDashboardPage = (state: RootState) =>
    getSettingsData(state)['global::newDashboardPage'];
