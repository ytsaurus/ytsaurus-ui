import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '../../../store/reducers';
import {accountsApi} from '../../../store/api/accounts';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';
import {getCluster, getCurrentUserName} from '../../../store/selectors/global';

import {dashboardConfig} from '../../../constants/dashboard2';

import {makeDefaultConfig} from '../../../utils/dashboard2/make-default-config';

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

        return makeDefaultConfig(username);
    },
);

export const getSettingNewDashboardPage = (state: RootState) =>
    getSettingsData(state)['global::newDashboardPage'];
