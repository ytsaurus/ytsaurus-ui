import {createSelector} from '@reduxjs/toolkit';

import {getSettingsData} from '../../../store/selectors/settings/settings-base';
import {getCluster} from '../../../store/selectors/global';

import {dashboardConfig} from '../../../constants/dashboard2';

export const getDashboardConfig = createSelector([getSettingsData, getCluster], (data, cluster) => {
    return data[`local::${cluster}::dashboard::config`] || dashboardConfig;
});
