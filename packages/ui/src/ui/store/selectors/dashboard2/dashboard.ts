import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '../../../store/reducers';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';
import {getCluster} from '../../../store/selectors/global';

import {dashboardConfig} from '../../../constants/dashboard2';

import {makeDefaultConfig} from '../../../utils/dashboard2/make-default-config';

export const getDashboardConfig = createSelector([getSettingsData, getCluster], (data, cluster) => {
    // if user setuped his dashboard on current cluster no need to retrun default values
    if (
        data[`local::${cluster}::dashboard::config`] &&
        data[`local::${cluster}::dashboard::config`]?.salt !== dashboardConfig.salt
    ) {
        return data[`local::${cluster}::dashboard::config`];
    }

    return makeDefaultConfig();
});

export const getSettingNewDashboardPage = (state: RootState) =>
    getSettingsData(state)['global::newDashboardPage'];
